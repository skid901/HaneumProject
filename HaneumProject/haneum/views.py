from django.shortcuts import render
from django.http.response import HttpResponse
import json


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
