''' 
Script para filtrar os conjuntos de desenhos
'''

import numpy as np

total_of_images = 999
files = ['data/finger.npy', 'data/clock.npy', 'data/face.npy']

for file in files:
    data = np.load(file)
    filtered = data[0:total_of_images]
    np.save('data_filtered/{}'.format(file.split('/')[1].split('.')[0] + '_filtered.npy'), filtered)
