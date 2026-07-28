import shutil
import os

uploaded_img = r"C:\Users\xoriz\.gemini\antigravity\brain\73ac6651-8c4e-47f9-a8df-6d361e21ccb5\.user_uploaded\media__1785207553180.png"
public_assets = r"c:\Users\xoriz\Desktop\tienda\public\assets\mini_usb_lamp.png"
assets = r"c:\Users\xoriz\Desktop\tienda\assets\mini_usb_lamp.png"

shutil.copy(uploaded_img, public_assets)
shutil.copy(uploaded_img, assets)
print("Copied user uploaded lamp image successfully!")
