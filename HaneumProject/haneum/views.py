from django.shortcuts import render
from django.http.response import HttpResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from HaneumProject.settings import STATICFILES_DIRS
import logging
import os
import shutil
import json
import pandas as pd

# News
from . import News

# Predict
from . import Predict
import numpy as np
import pickle


pd.set_option('display.height', 1000)
pd.set_option('display.max_rows', 500)
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

# Create your views here.

logger = logging.getLogger(__name__)

news = News.News()

predict = Predict.Predict()

column_translation = {
    '회사명': 'CompanyName',
	'년도': 'Year',
	'부도여부': 'Bankruptcy',

	'재고자산': 'Inventory',
	'매출채권': 'AccountsReceivable',
	'자산총계': 'InventoryTotalAssets',
	'총차입금': 'TotalBorrowings',
	'부채총계': 'TotalLiabilities',
	'자본총계': 'TotalCapital',

	'매출액': 'Sales',
	'매출원가': 'CostofGoodsSold',
	'영업이익': 'OperatingProfit',
	'금융비용': 'FinancialCosts',
	'당기순이익': 'NetIncome',

	'영업활동으로인한현금흐름': 'OperatingActivitiesCashFlow',
    '투자활동으로인한현금흐름': 'InvestmentActivitiesCashFlow',
    '재무활동으로인한현금흐름': 'FinancialActivitiesCashFlow',
    
    '매출채권회전율': 'AccountsReceivableTurnover',
    '매출채권회전일수': 'AccountsReceivableTurnoverDays',
    '재고자산회전율': 'InventoryTurnover',
    '재고자산회전일수': 'InventoryTurnoverDays',
	'부채비율': 'DebtRatio'    
}

def index(request):
    context = {}
    return render(request, 'haneum/index.html', context)


@csrf_exempt
def upload(reqeust):
    return_json = {
        'status': 0
    }
    logger.info('000')
    if reqeust.method == 'POST':
        logger.info(reqeust.FILES)
        logger.info('001')
        if 'file' in reqeust.FILES:
            logger.info('002')
            file = reqeust.FILES['file']
            filename = file._name
            logger.info(filename)
            
            # 파일 저장
            upload_root = STATICFILES_DIRS[0] + '\\haneum\\upload'
            upload_file = open('%s\\%s' % (upload_root, filename), 'wb')
            for chunk in file.chunks():
                upload_file.write(chunk)
            upload_file.close()
            # 저장된 파일로 부터 dataframe 추출
            df = pd.read_excel('%s\\%s' % (upload_root, filename))
            # dataframe 컬럼 명 치환
            df.rename(columns=column_translation, inplace=True)
            # 데이터를 json 객체로 변환
            df_jsonString = df.to_json( orient='records')
            df_json = json.loads(df_jsonString)
            logger.info('003')
            logger.info(df_json)
            # 반환 json 객체에 데이터 할당
            return_json["data"] = df_json

            # 업로드 파일로 작업 수행
            logger.info('004')
            corpName = df_json[0]['CompanyName']
            year = df_json[0]['Year']
            capital = df_json[0]['TotalCapital']
            #logger.info(corpName)
            logger.info(year)
            logger.info(type(year))
            logger.info(capital)
            logger.info(type(capital))
            
            # 뉴스 데이터 획득
            news_json = news.getNews(corpName)
            logger.info('news')
            logger.info(news_json['items'])
            return_json['news'] = news_json['items']

            # 예측 모델 수행
            financial_index = predict.financial_data()
            df = predict.append_financial_Index(df, financial_index)
            predict_data = predict.create_dataset(df, 3)
            X_predict = predict_data.tolist()
            x_year = np.array(df['Year'][-1*predict_data.shape[0]:]).reshape(predict_data.shape[0],1)
            
            saved_model_root =  STATICFILES_DIRS[0] + '\\haneum\\data'
            saved_model_name = 'finalized_model_2.sav'  # 'model.sav'  # 'finalized_model.sav'

            loaded_model = pickle.load(open('%s\\%s' % (saved_model_root, saved_model_name), 'rb'))
            Y_predict = loaded_model.predict_proba(X_predict)
            predict_list = np.hstack([x_year, Y_predict]).tolist()
            logger.info('predict_list')
            logger.info(predict_list)
            predict_json_list = []
            for el in predict_list:
                predict_json_list.append({'Year': el[0], 'NonBankruptcy': el[1], 'Bankruptcy': el[2]})

            # predict_json_list = [
            #     {'Year': 2011, 'NonBankruptcy': 0.07, 'Bankruptcy': 0.92},
            #     {'Year': 2012, 'NonBankruptcy': 0.17, 'Bankruptcy': 0.82},
            #     {'Year': 2013, 'NonBankruptcy': 0.27, 'Bankruptcy': 0.72},
            #     {'Year': 2014, 'NonBankruptcy': 0.37, 'Bankruptcy': 0.62},
            #     {'Year': 2015, 'NonBankruptcy': 0.47, 'Bankruptcy': 0.52},
            #     {'Year': 2016, 'NonBankruptcy': 0.57, 'Bankruptcy': 0.42},
            #     {'Year': 2017, 'NonBankruptcy': 0.67, 'Bankruptcy': 0.32},
            #     {'Year': 2018, 'NonBankruptcy': 0.77, 'Bankruptcy': 0.22},
            #     {'Year': 2019, 'NonBankruptcy': 0.87, 'Bankruptcy': 0.12},
            #     {'Year': 2020, 'NonBankruptcy': 0.97, 'Bankruptcy': 0.02}
            # ]

            return_json['predict'] = predict_json_list

            # 업로드 파일 삭제
            '''
            shutil.rmtree(upload_root)
            os.mkdir(upload_root)
            '''

            return_json['status'] = 1

    '''
    ### 개발 테스트용 코드(샘플데이터 사용) ###
    logger.info('004')
    json_root =  STATICFILES_DIRS[0] + '\\haneum\\data'
    json_filename = 'sample2.json'
    with open('%s\\%s' % (json_root, json_filename)) as json_file:
        return_json["data"] = json.load(json_file)
    return_json['status'] = 1
    # return_json['news'] = news_json
    #########################
    '''

    return_jsonString = json.dumps(return_json)
    logger.info('005')
    logger.info(return_jsonString)
    return HttpResponse(return_jsonString)


def download(request):
    download_root = STATICFILES_DIRS[0] + '\\haneum\\download'
    filename = 'form.xlsx'
    with open('%s\\%s' % (download_root, filename), 'rb') as download_file:
        response = HttpResponse(
            download_file, content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="%s"' % (filename)
        return response
    raise Http404

