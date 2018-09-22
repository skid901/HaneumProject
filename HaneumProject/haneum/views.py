from django.shortcuts import render
from django.http.response import HttpResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from HaneumProject.settings import STATICFILES_DIRS
import logging
import os
import shutil
import json


# Create your views here.

logger = logging.getLogger(__name__)

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
            
            '''
            upload_root = STATICFILES_DIRS[0] + '\\haneum\\upload'
            upload_file = open('%s\\%s' % (upload_root, filename), 'wb')
            for chunk in file.chunks():
                upload_file.write(chunk)
            upload_file.close()
           
            # 업로드 파일로 작업 수행

            shutil.rmtree(upload_root)
            os.mkdir(upload_root)
            return_json['status'] = 1
            '''
            
            # 업로드 파일로 작업 수행
            # file.read()
            # corpName = file.corpName
            # news_json = getNews(corpName)

            return_json['status'] = 1

    ### 개발 테스트용 코드 ###
    logger.info('003')
    json_root =  STATICFILES_DIRS[0] + '\\haneum\\data'
    json_filename = 'sample.json'
    with open('%s\\%s' % (json_root, json_filename)) as json_file:
        return_json["data"] = json.load(json_file)
    return_json['status'] = 1
    # return_json['news'] = news_json
    #########################

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


