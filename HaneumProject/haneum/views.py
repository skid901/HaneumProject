from django.shortcuts import render
from django.http.response import HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
import json
from HaneumProject.settings import STATICFILES_DIRS

# Create your views here.


def index(request):
    context = {}
    return render(request, 'haneum/index.html', context)


def search(request):
    # 데이터를 전달할 JSON 객체 선언
    data = {}
    # 데이터 저장 성공 여부 설정(디폴트 값: 0 - 성공)
    data['status'] = 0  # success
    try:
        # 데이터 획득 작업 수행
        
        # data JSON에 전달할 데이터를 저장
        data['test'] = 'test'
    except Exception:
         # 데이터 저장 성공 여부 설정(1 - 실패)
        data['status'] = 1  # fail
    # JSON 객체를 JSON String으로 변환 후 반환
    response = json.dumps(data)
    return HttpResponse(response)

@csrf_exempt
def upload(reqeust):
    status = 0
    if reqeust.method == 'POST':
        if 'file' in reqeust.FILES:
            file = reqeust.FILES['file']
            filename = file._name
            
            upload_root = STATICFILES_DIRS[0] + '\\haneum\\upload'
            print( '%s\\%s' % (upload_root, filename) )
            fp = open('%s\\%s' % (upload_root, filename) , 'wb')
            for chunk in file.chunks():
                fp.write(chunk)
            fp.close()
            status = 1
    return HttpResponse(status)

def download(request):
    download_root = STATICFILES_DIRS[0] + '\\haneum\\download'
    fp = open('%s\\%s' % (download_root, 'finance.xlsx') , 'rb')
    response = FileResponse(fp, content_type='application/vnd.ms-excel')
    return response
