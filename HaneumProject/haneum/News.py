import os
import sys
import urllib.request
import json
import logging

from django.shortcuts import render

class News:
    @staticmethod
    def getNews(corporation_name):
        # id와 secret 키는 노출되지 않아야 하기 때문에, 보안성 강화를 위해서는 추후에 따로 json 파일을 만들어서 load하는 과정이 필요
        # config_secret_debug = json.loads(open(CONFIG_SECRET_DEBUG_FILE).read())
        client_id = "ehqaEu5oehO5r7UWArqf"
        client_secret = "Ac3HqvjIzw"
        # corporation_name은 사용자가 검색한 기업명
        encText = urllib.parse.quote(corporation_name) 
        # json 결과 (@수연_뉴스10개 출력/첫번째 결과부터 출력/유사순으로 정렬)
        # json 결과 (@수연_뉴스10개 출력/첫번째 결과부터 출력/유사순으로 정렬)
        url = "https://openapi.naver.com/v1/search/news.json?query=" + encText \
            + "&display=10&start=1&sort=sim" 
        

        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id",client_id)
        request.add_header("X-Naver-Client-Secret",client_secret)
        response = urllib.request.urlopen(request)
        rescode = response.getcode()

        if (rescode == 200):
            response_body = response.read()
            result = json.loads(response_body.decode('utf-8'))
            items = result.get('items')

            return result
        return {'item': ''} # 예외처리
