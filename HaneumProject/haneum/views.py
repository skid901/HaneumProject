from django.shortcuts import render
from django.http.response import HttpResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from HaneumProject.settings import STATICFILES_DIRS
import logging
import os
import shutil
import json
import pandas as pd
pd.set_option('display.height', 1000)
pd.set_option('display.max_rows', 500)
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

# Create your views here.

logger = logging.getLogger(__name__)

column_translation = {
    '회사명' : 'CompanyName',
    '년도' : 'Year',
    '매출액' : 'Sales',
    '영업이익' : 'OperatingProfit',
    '당기순이익' : 'NetIncome',
    '영업활동으로인한현금흐름' : 'OperatingActivitiesCashFlow',
    '투자활동으로인한현금흐름' : 'InvestmentActivitiesCashFlow',
    '재무활동으로인한현금흐름' : 'FinancialActivitiesCashFlow',
    '매출채권' : 'AccountsReceivable',
    '매출채권회전율(매출액/(sum매출채권/count매출채권))' : 'AccountsReceivableTurnover',
    '매출채권회전일수(365/매출채권회전율)' : 'AccountsReceivableTurnoverDays',
    '매출원가' : 'CostofGoodsSold',
    '재고자산' : 'Inventory',
    '재고자산회전율(매출원가/(sum재고자산/count재고자산))' : 'InventoryTurnover',
    '재고자산회전일수(365/재고자산회전율)' : 'InventoryTurnoverDays',
    '자산총계' : 'InventoryTotalAssets',
    '총차입금' : 'TotalBorrowings',
    '금융비용(손익)' : 'FinancialCosts',
    '부채총계' : 'TotalLiabilities',
    '자본총계' : 'TotalCapital',
    '부채비율(부채총계/자본총계)' : 'DebtRatio',
    '부도여부' : 'Bankruptcy'
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
            df_json = df.to_json( orient='records')
            logger.info('003')
            logger.info(df_json)
            # 반환 json 객체에 데이터 할당
            return_json["data"] = df_json

            # 업로드 파일로 작업 수행
            # file.read()
            # corpName = file.corpName
            # news_json = getNews(corpName)

            # 업로드 파일 삭제
            shutil.rmtree(upload_root)
            os.mkdir(upload_root)
            return_json['status'] = 1

    '''
    ### 개발 테스트용 코드 ###
    logger.info('004')
    json_root =  STATICFILES_DIRS[0] + '\\haneum\\data'
    json_filename = 'sample.json'
    with open('%s\\%s' % (json_root, json_filename)) as json_file:
        return_json["data"] = json.load(json_file)
    return_json['status'] = 1
    # return_json['news'] = news_json
    #########################
    '''

    return_jsonString = json.dumps(return_json)
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

