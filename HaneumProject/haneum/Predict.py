
import numpy as np

class Predict:
    def create_dataset(self, dataset, look_back):
        dataset = np.array(dataset)
        
        temp_row_data = []
        company_data = []
        if (len(dataset)-look_back+1) >= 1:
            for i in range(0,len(dataset)-look_back+1):
                for j in range(0,look_back): 
                    # look_back 만큼의 데이터를 한줄로 만든다.
                    temp_row_data = np.hstack([temp_row_data,dataset[i+j][2:]])
                if i==0 :
                    company_data = temp_row_data
                else :
                    # 한줄로 만든 회사 데이터를 세로로 붙인다.
                    company_data = np.vstack([company_data,temp_row_data]) 
                temp_row_data = []
        elif len(dataset) == 1:
            for i in range(3) :
                company_data = np.hstack([company_data,dataset[0][2:]])
        else :
            for i in range(2) :
                company_data = np.hstack([company_data,dataset[i][2:]])
            company_data = np.hstack([company_data, dataset[1][2:]])
        return company_data
