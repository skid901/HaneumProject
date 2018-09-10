from django.shortcuts import render
from django.http.response import HttpResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from HaneumProject.settings import STATICFILES_DIRS
import os
import shutil
import json

# Create your views here.


def index(request):
    context = {}
    return render(request, 'haneum/index.html', context)


@csrf_exempt
def upload(reqeust):
    status = 0
    return_jsonString = '[]'
    if reqeust.method == 'POST':
        if 'file' in reqeust.FILES:
            file = reqeust.FILES['file']
            filename = file._name

            upload_root = STATICFILES_DIRS[0] + '\\haneum\\upload'
            upload_file = open('%s\\%s' % (upload_root, filename), 'wb')
            for chunk in file.chunks():
                upload_file.write(chunk)
            upload_file.close()

            # 업로드 파일로 작업 수행

            ### 개발 테스트용 코드 ###
            json_root =  STATICFILES_DIRS[0] + '\\haneum\\data'
            json_filename = 'sample.json'
            jsonString = open('%s\\%s' % (json_root, json_filename)).read()
            status = 1
            return_json = {
                "status": status,
                "jsonList": jsonString
            }
            return_jsonString = json.dumps(return_json)
            #########################

            shutil.rmtree(upload_root)
            os.mkdir(upload_root)
            status = 1
    return HttpResponse(return_jsonString)


def download(request):
    download_root = STATICFILES_DIRS[0] + '\\haneum\\download'
    filename = 'form.xlsx'
    with open('%s\\%s' % (download_root, filename), 'rb') as download_file:
        response = HttpResponse(
            download_file, content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="%s"' % (
            filename)
        return response
    raise Http404
