import urllib.request
import os

# Sound effects from Pixabay (royalty-free)
sounds = {
    'click': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3?filename=click-button-140881.mp3',
    'erase': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8a431a1d8.mp3?filename=eraser-89770.mp3',
    'toggle': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_d802a89d73.mp3?filename=toggle-switch-140571.mp3',
    'move': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8595d6c67.mp3?filename=slide-click-140878.mp3'
}

# Create audio directory if it doesn't exist
os.makedirs('audio', exist_ok=True)

# Download each sound effect
for name, url in sounds.items():
    output_path = f'audio/{name}.mp3'
    print(f'Downloading {name}.mp3...')
    try:
        urllib.request.urlretrieve(url, output_path)
        print(f'Successfully downloaded {name}.mp3')
    except Exception as e:
        print(f'Error downloading {name}.mp3: {e}')
