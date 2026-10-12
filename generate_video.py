import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import math
import os

width, height = 800, 600
fps = 30
duration = 6.0
total_frames = int(fps * duration)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video_path = 'assets/ai-greeting.mp4'
out = cv2.VideoWriter(video_path, fourcc, float(fps), (width, height))

def get_font(size):
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

title_font = get_font(26)
sub_font = get_font(19)
small_font = get_font(14)
quote_font = get_font(21)

# Load and prepare Sreekanth's profile image
profile_orig = Image.open('assets/profile.jpg').convert('RGB')
core_diameter = 160
# Make circular crop
mask = Image.new('L', (core_diameter, core_diameter), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, core_diameter, core_diameter), fill=255)

# Fit profile to square
min_side = min(profile_orig.size)
crop_x = (profile_orig.width - min_side) // 2
crop_y = int(profile_orig.height * 0.05) # focus slightly toward face
cropped_sq = profile_orig.crop((crop_x, crop_y, crop_x + min_side, crop_y + min_side))
resized_avatar = cropped_sq.resize((core_diameter, core_diameter), Image.Resampling.LANCZOS)
circle_avatar = Image.new('RGBA', (core_diameter, core_diameter), (0, 0, 0, 0))
circle_avatar.paste(resized_avatar, (0, 0))
circle_avatar.putalpha(mask)

cx, cy = width // 2, 205

for frame_idx in range(total_frames):
    t = frame_idx / fps

    img = Image.new('RGB', (width, height), color=(7, 11, 20))
    draw = ImageDraw.Draw(img)

    # Ambient radial pulses
    pulse = 0.85 + 0.15 * math.sin(t * 3.5)
    glow_radius = int(145 * pulse)

    # Concentric glowing rings
    for r in range(glow_radius, 85, -15):
        alpha = int(40 * (1 - r / glow_radius))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(0, 210, 255), width=1)

    # Rotating HUD tick marks
    angle_offset = t * 45.0
    for deg in range(0, 360, 20):
        rad = math.radians(deg + angle_offset)
        r1 = 98
        r2 = 108 if deg % 40 == 0 else 103
        x1 = cx + r1 * math.cos(rad)
        y1 = cy + r1 * math.sin(rad)
        x2 = cx + r2 * math.cos(rad)
        y2 = cy + r2 * math.sin(rad)
        draw.line([x1, y1, x2, y2], fill=(0, 245, 212), width=2 if deg % 40 == 0 else 1)

    # Counter-rotating outer ring
    angle_offset2 = -t * 25.0
    for deg in range(0, 360, 10):
        if (deg // 10) % 2 == 0:
            rad1 = math.radians(deg + angle_offset2)
            rad2 = math.radians(deg + 6 + angle_offset2)
            x1 = cx + 118 * math.cos(rad1)
            y1 = cy + 118 * math.sin(rad1)
            x2 = cx + 118 * math.cos(rad2)
            y2 = cy + 118 * math.sin(rad2)
            draw.line([x1, y1, x2, y2], fill=(139, 92, 246), width=2)

    # Paste circular real avatar of Sreekanth
    avatar_x = cx - core_diameter // 2
    avatar_y = cy - core_diameter // 2
    img.paste(circle_avatar, (avatar_x, avatar_y), circle_avatar)

    # Glowing ring border around avatar
    draw.ellipse([avatar_x - 3, avatar_y - 3, avatar_x + core_diameter + 3, avatar_y + core_diameter + 3], outline=(0, 210, 255), width=3)

    # Soundwave bars below avatar
    num_bars = 28
    bar_width = 5
    bar_gap = 4
    total_bars_w = num_bars * (bar_width + bar_gap)
    start_x = cx - total_bars_w // 2
    bars_y = cy + 95
    for b in range(num_bars):
        freq = (b + 1) * 1.6
        h_bar = int(10 + 26 * abs(math.sin(t * 6.0 + freq)) * pulse)
        bx = start_x + b * (bar_width + bar_gap)
        by1 = bars_y - h_bar // 2
        by2 = bars_y + h_bar // 2
        
        r_col = int(0 + 139 * (b / num_bars))
        g_col = int(245 - 130 * (b / num_bars))
        b_col = 255
        draw.rounded_rectangle([bx, by1, bx + bar_width, by2], radius=2, fill=(r_col, g_col, b_col))

    # AI Status Pill at top
    status_w = 210
    draw.rounded_rectangle([cx - status_w//2, 26, cx + status_w//2, 54], radius=14, fill=(15, 23, 42), outline=(0, 210, 255), width=1)
    draw.ellipse([cx - status_w//2 + 14, 36, cx - status_w//2 + 22, 44], fill=(0, 245, 212))
    draw.text((cx - status_w//2 + 30, 33), "AI GREETING SYSTEM", font=small_font, fill=(200, 230, 255))

    # Name Title
    name_text = "SREEKANTH DAMODAR"
    bbox = draw.textbbox((0, 0), name_text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw//2, 365), name_text, font=title_font, fill=(255, 255, 255))

    # Role Subtitle
    role_text = "Python Full Stack Developer  |  AI & ML Specialist"
    bbox_role = draw.textbbox((0, 0), role_text, font=sub_font)
    rw = bbox_role[2] - bbox_role[0]
    draw.text((cx - rw//2, 402), role_text, font=sub_font, fill=(0, 210, 255))

    # Speech Bubble Card
    dialog_box = [cx - 330, 448, cx + 330, 528]
    draw.rounded_rectangle(dialog_box, radius=12, fill=(13, 21, 38), outline=(139, 92, 246), width=1)

    quote_full = "\"Hi, I'm Sreekanth Damodar. Welcome to my portfolio!\""
    chars_to_show = min(len(quote_full), int(t * 18))
    displayed_quote = quote_full[:chars_to_show]
    if int(t * 3) % 2 == 0 and chars_to_show < len(quote_full):
        displayed_quote += "_"

    bbox_q = draw.textbbox((0, 0), displayed_quote, font=quote_font)
    qw = bbox_q[2] - bbox_q[0]
    draw.text((cx - qw//2, 475), displayed_quote, font=quote_font, fill=(240, 245, 255))

    frame_np = np.array(img)
    frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
    out.write(frame_bgr)

    if frame_idx == int(fps * 2.8):
        img.save('assets/ai-greeting-poster.jpg', quality=95)

out.release()
print('Regenerated AI greeting video and poster with Sreekanth Damodar portrait successfully!')
