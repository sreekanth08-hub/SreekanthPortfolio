import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import math
import os

width, height = 800, 600
fps = 30
duration = 6.0
total_frames = int(fps * duration)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video_path = 'assets/ai-greeting.mp4'
out = cv2.VideoWriter(video_path, fourcc, float(fps), (width, height))

def get_font(size, bold=True):
    font_paths = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/consola.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

title_font = get_font(28, bold=True)
sub_font = get_font(18, bold=False)
tag_font = get_font(13, bold=True)
quote_font = get_font(22, bold=True)

# Load Sreekanth's new official profile photo
profile_raw = Image.open('assets/profile.jpg').convert('RGB')
w, h = profile_raw.size

# Target face region: crop square around upper torso and head
avatar_dim = 170
crop_size = int(w * 0.95)
crop_left = (w - crop_size) // 2
crop_top = int(h * 0.16) # centered on his face
face_cropped = profile_raw.crop((crop_left, crop_top, crop_left + crop_size, crop_top + crop_size))
face_resized = face_cropped.resize((avatar_dim, avatar_dim), Image.Resampling.LANCZOS)

# Create circular mask
mask = Image.new('L', (avatar_dim * 2, avatar_dim * 2), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, avatar_dim * 2, avatar_dim * 2), fill=255)
mask = mask.resize((avatar_dim, avatar_dim), Image.Resampling.LANCZOS)

avatar_rgba = Image.new('RGBA', (avatar_dim, avatar_dim), (0, 0, 0, 0))
avatar_rgba.paste(face_resized, (0, 0))
avatar_rgba.putalpha(mask)

cx, cy = width // 2, 195

for frame_idx in range(total_frames):
    t = frame_idx / fps

    # Deep futuristic dark navy
    frame_img = Image.new('RGB', (width, height), color=(6, 10, 20))
    draw = ImageDraw.Draw(frame_img)

    # 1. Background Grid Lines
    for gy in range(40, height, 40):
        intensity = int(12 + 6 * math.sin(gy * 0.05 + t * 2))
        draw.line([(0, gy), (width, gy)], fill=(15, 25, intensity + 35), width=1)
    for gx in range(40, width, 50):
        draw.line([(gx, 0), (gx, height)], fill=(12, 20, 38), width=1)

    # 2. Pulsing Glow
    pulse = 0.88 + 0.12 * math.sin(t * 4.0)
    max_glow_r = int(140 * pulse)
    for r in range(max_glow_r, 90, -12):
        ratio = (r - 90) / (max_glow_r - 90 + 0.01)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     outline=(int(100 * (1 - ratio)), int(220 * (1 - ratio)), 255), width=1)

    # 3. Rotating Orbital HUD Rings
    angle1 = t * 50.0
    for deg in range(0, 360, 15):
        rad = math.radians(deg + angle1)
        r_inner = 104
        r_outer = 114 if deg % 45 == 0 else 109
        x1 = cx + r_inner * math.cos(rad)
        y1 = cy + r_inner * math.sin(rad)
        x2 = cx + r_outer * math.cos(rad)
        y2 = cy + r_outer * math.sin(rad)
        col = (0, 245, 212) if deg % 45 == 0 else (0, 190, 245)
        draw.line([x1, y1, x2, y2], fill=col, width=2 if deg % 45 == 0 else 1)

    angle2 = -t * 30.0
    for deg in range(0, 360, 10):
        if (deg // 10) % 2 == 0:
            rad1 = math.radians(deg + angle2)
            rad2 = math.radians(deg + 6 + angle2)
            draw.line([cx + 128 * math.cos(rad1), cy + 128 * math.sin(rad1),
                       cx + 128 * math.cos(rad2), cy + 128 * math.sin(rad2)],
                      fill=(139, 92, 246), width=2)

    # 4. Paste Real Portrait Avatar
    av_x = cx - avatar_dim // 2
    av_y = cy - avatar_dim // 2
    frame_img.paste(avatar_rgba, (av_x, av_y), avatar_rgba)

    # 5. Neon Rings Around Avatar
    draw.ellipse([av_x - 3, av_y - 3, av_x + avatar_dim + 3, av_y + avatar_dim + 3], outline=(0, 245, 212), width=2)
    draw.ellipse([av_x - 6, av_y - 6, av_x + avatar_dim + 6, av_y + avatar_dim + 6], outline=(139, 92, 246), width=1)

    # 6. Scanning Line
    scan_y = av_y + int(avatar_dim * ((t * 0.75) % 1.0))
    scan_half_w = int(math.sqrt(max(0, (avatar_dim//2)**2 - (scan_y - cy)**2))) if abs(scan_y - cy) < avatar_dim//2 else 0
    if scan_half_w > 0:
        draw.line([(cx - scan_half_w, scan_y), (cx + scan_half_w, scan_y)], fill=(120, 255, 240), width=2)

    # 7. Equalizer Audio Waveform Bars
    num_bars = 32
    b_width = 4
    b_gap = 4
    total_w = num_bars * (b_width + b_gap)
    start_bx = cx - total_w // 2
    bars_base_y = cy + 102

    for b in range(num_bars):
        dist_center = abs(b - num_bars / 2) / (num_bars / 2)
        freq_wave = math.sin(t * 7.0 + b * 0.45) * math.cos(t * 3.5 + b * 0.25)
        bar_h = int(6 + 32 * abs(freq_wave) * (1.2 - 0.5 * dist_center) * pulse)
        
        bx = start_bx + b * (b_width + b_gap)
        by1 = bars_base_y - bar_h // 2
        by2 = bars_base_y + bar_h // 2
        
        c_ratio = b / num_bars
        r_c = int(0 + 200 * c_ratio)
        g_c = int(245 - 180 * c_ratio)
        b_c = 255
        draw.rounded_rectangle([bx, by1, bx + b_width, by2], radius=2, fill=(r_c, g_c, b_c))

    # 8. Top Status Tag
    tag_w = 230
    draw.rounded_rectangle([cx - tag_w//2, 24, cx + tag_w//2, 52], radius=14, fill=(12, 18, 34), outline=(0, 210, 255), width=1)
    draw.ellipse([cx - tag_w//2 + 14, 34, cx - tag_w//2 + 22, 42], fill=(0, 245, 212))
    draw.text((cx - tag_w//2 + 30, 31), "● INTERACTIVE AI GREETING", font=tag_font, fill=(200, 240, 255))

    # 9. Main Name Typography
    name_str = "SREEKANTH DAMODAR"
    nb = draw.textbbox((0, 0), name_str, font=title_font)
    nw = nb[2] - nb[0]
    draw.text((cx - nw//2, 355), name_str, font=title_font, fill=(255, 255, 255))

    # 10. Role Subtitle
    sub_str = "Python Full Stack Developer   |   AI & ML Specialist"
    sb = draw.textbbox((0, 0), sub_str, font=sub_font)
    sw = sb[2] - sb[0]
    draw.text((cx - sw//2, 396), sub_str, font=sub_font, fill=(0, 220, 255))

    # 11. Speech Greeting Dialogue Bubble
    box = [cx - 330, 442, cx + 330, 532]
    draw.rounded_rectangle(box, radius=14, fill=(11, 18, 36), outline=(139, 92, 246), width=1)
    draw.line([(cx - 300, 442), (cx + 300, 442)], fill=(0, 245, 212), width=2)

    full_quote = "\"Hi, I'm Sreekanth Damodar. Welcome to my portfolio!\""
    chars_to_show = min(len(full_quote), int(t * 19))
    typed_quote = full_quote[:chars_to_show]
    if int(t * 3) % 2 == 0 and chars_to_show < len(full_quote):
        typed_quote += "_"

    qb = draw.textbbox((0, 0), typed_quote, font=quote_font)
    qw = qb[2] - qb[0]
    draw.text((cx - qw//2, 474), typed_quote, font=quote_font, fill=(245, 250, 255))

    # 12. Bottom Mini Tagline
    bot_str = "Computer Science (AI & ML) • Siddartha Institute of Science and Technology"
    bb = draw.textbbox((0, 0), bot_str, font=tag_font)
    bw = bb[2] - bb[0]
    draw.text((cx - bw//2, 555), bot_str, font=tag_font, fill=(120, 140, 170))

    frame_bgr = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
    out.write(frame_bgr)

    if frame_idx == int(fps * 2.7):
        frame_img.save('assets/ai-greeting-poster.jpg', quality=95)

out.release()
print('SUCCESS: Brand new video and poster with user provided photo generated successfully!')
