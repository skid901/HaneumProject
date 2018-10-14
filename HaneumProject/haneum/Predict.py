from urllib.request import urlopen
import pandas as pd
import numpy as np
import requests
import json


class Predict:
    def create_dataset(self, dataset, look_back):
        dataset = np.array(dataset)

        temp_row_data = []
        company_data = []
        if (len(dataset)-look_back+1) >= 1:
            for i in range(0, len(dataset)-look_back+1):
                for j in range(0, look_back):
                    # look_back 만큼의 데이터를 한줄로 만든다.
                    temp_row_data = np.hstack(
                        [temp_row_data, dataset[i+j][2:]])
                if i == 0:
                    company_data = temp_row_data
                else:
                    # 한줄로 만든 회사 데이터를 세로로 붙인다.
                    company_data = np.vstack([company_data, temp_row_data])
                temp_row_data = []
        elif len(dataset) == 1:
            for i in range(3):
                company_data = np.hstack([company_data, dataset[0][2:]])
        else:
            for i in range(2):
                company_data = np.hstack([company_data, dataset[i][2:]])
            company_data = np.hstack([company_data, dataset[1][2:]])
        return company_data

    def financial_data(self):
        key = ''

        Currency = "http://ecos.bok.or.kr/api/StatisticSearch/"+key + \
            "/json/kr/1/1000/I01Y002/YY/199001/201805/KOR/?/?/"  # 통화량
        TreasuryBond = "http://ecos.bok.or.kr/api/StatisticSearch/"+key + \
            "/json/kr/1/1000/I04Y005/YY/199001/201805/1010701/?/?/"  # 금리
        ProducerPriceIndex = "http://ecos.bok.or.kr/api/StatisticSearch/" + \
            key+"/json/kr/1/1000/I02Y001/YY/199001/201805/KOR/?/?/"  # 물가
        ConsumerPriceIndex = "http://ecos.bok.or.kr/api/StatisticSearch/" + \
            key+"/json/kr/1/1000/I02Y002/YY/199001/201805/KOR/?/?/"  # 물가
        UnemploymentRate = "http://ecos.bok.or.kr/api/StatisticSearch/" + \
            key+"/json/kr/1/1000/I05Y002/YY/199001/201805/KOR/?/?/"
        EconomicGrowthRate = "http://ecos.bok.or.kr/api/StatisticSearch/" + \
            key+"/json/kr/1/1000/I05Y003/YY/199001/201805/KOR/?/?/"
        GDP = "http://ecos.bok.or.kr/api/StatisticSearch/"+key + \
            "/json/kr/1/1000/I05Y004/YY/199001/201805/KOR/?/?/"

        #기본 DataFrame 생성
        index = {'Year': [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
                          2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
                          2011, 2012, 2013, 2014, 2015, 2016, 2017]}
        financial_index = pd.DataFrame(index)

        #협의통화
        data = json.loads(urlopen(Currency).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_Currency = pd.DataFrame(data)
        financial_index['Currency'] = df_Currency['DATA_VALUE']

        #생산자 물가지수
        data = json.loads(urlopen(ProducerPriceIndex).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_ProducerPriceIndex = pd.DataFrame(data)
        financial_index['ProducerPriceIndex'] = df_ProducerPriceIndex['DATA_VALUE']

        #소비자 물가지수
        data = json.loads(urlopen(ConsumerPriceIndex).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_ConsumerPriceIndex = pd.DataFrame(data)
        financial_index['ConsumerPriceIndex'] = df_ConsumerPriceIndex['DATA_VALUE']

        #실업률
        data = json.loads(urlopen(UnemploymentRate).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_UnemploymentRate = pd.DataFrame(data)
        financial_index['UnemploymentRate'] = df_UnemploymentRate['DATA_VALUE']

        #경제 성장률
        data = json.loads(urlopen(EconomicGrowthRate).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_EconomicGrowthRate = pd.DataFrame(data)
        financial_index['EconomicGrowthRate'] = df_EconomicGrowthRate['DATA_VALUE']

        #국내 총생산
        data = json.loads(urlopen(GDP).read().decode('utf-8'), encoding='utf-8')
        data = data["StatisticSearch"]["row"]
        df_GDP = pd.DataFrame(data)
        financial_index['GDP'] = df_GDP['DATA_VALUE']

        return financial_index

    def append_financial_Index(self, df, financial_index):
        df = pd.merge(df, financial_index, on="Year")
        df.sort_values(by=['CompanyName', 'Year'], inplace=True)

        #row re-indexing
        df = df.reset_index(drop=True)

        return df
