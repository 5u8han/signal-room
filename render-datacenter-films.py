"""Render original datacenter-maintenance films for the new portfolio.

This writes only the named tech-ad MP4/JPG files and tech-ads.json under this
project's dist/assets. --replace replaces these copied/generated assets only;
it does not affect the earlier VidStream portfolio lab or other media.
Uses existing local Pillow, FFmpeg, FFprobe and project font files. No stock
footage, external services, audio or downloads are used.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import shutil
import subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent
ASSETS=ROOT/'dist'/'assets'
WIDTH,HEIGHT,SCALE=960,540,2
FPS,SECONDS=30,12
TAU=math.tau
FONTS={}

def font(size: float, face: str = "regular") -> ImageFont.FreeTypeFont:
    key = face, round(size * SCALE)
    if key not in FONTS:
        filename = {"regular": "geist-regular.ttf", "medium": "geist-medium.ttf", "display": "display-bold.ttf"}[face]
        FONTS[key] = ImageFont.truetype(str(ASSETS / filename), key[1])
    return FONTS[key]


def rgba(color: str | tuple, alpha: int = 255) -> tuple:
    if isinstance(color, tuple):
        return (*color[:3], alpha if len(color) == 3 else color[3])
    value = color.lstrip("#")
    return (*tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)), alpha)


def mix(a: str, b: str, amount: float) -> tuple:
    aa, bb = rgba(a), rgba(b)
    return tuple(round(aa[i] + (bb[i] - aa[i]) * amount) for i in range(3)) + (255,)


class Canvas:
    def __init__(self, color: str | tuple = (0, 0, 0, 0)):
        self.opaque = rgba(color)[3] == 255
        self.image = Image.new("RGB" if self.opaque else "RGBA", (WIDTH * SCALE, HEIGHT * SCALE), rgba(color)[:3] if self.opaque else rgba(color))
        self.draw = ImageDraw.Draw(self.image, "RGBA")

    def line(self, points, color, width=1):
        self.draw.line([(round(x * SCALE), round(y * SCALE)) for x, y in points], fill=color, width=max(1, round(width * SCALE)), joint="curve")

    def poly(self, points, fill=None, outline=None, width=1):
        p = [(round(x * SCALE), round(y * SCALE)) for x, y in points]
        self.draw.polygon(p, fill=fill)
        if outline:
            self.draw.line(p + [p[0]], fill=outline, width=max(1, round(width * SCALE)), joint="curve")

    def rect(self, bounds, fill=None, outline=None, width=1, radius=0):
        b = tuple(round(n * SCALE) for n in bounds)
        if radius:
            self.draw.rounded_rectangle(b, radius=round(radius * SCALE), fill=fill, outline=outline, width=max(1, round(width * SCALE)))
        else:
            self.draw.rectangle(b, fill=fill, outline=outline, width=max(1, round(width * SCALE)))

    def ellipse(self, bounds, fill=None, outline=None, width=1):
        self.draw.ellipse(tuple(round(n * SCALE) for n in bounds), fill=fill, outline=outline, width=max(1, round(width * SCALE)))

    def circle(self, x, y, r, fill=None, outline=None, width=1):
        self.ellipse((x - r, y - r, x + r, y + r), fill, outline, width)

    def arc(self, bounds, start, end, color, width=1):
        self.draw.arc(tuple(round(n * SCALE) for n in bounds), start, end, fill=color, width=max(1, round(width * SCALE)))

    def text(self, pos, value, size=12, color="#ffffff", face="regular", anchor="lt"):
        xy, glyph_font = (round(pos[0] * SCALE), round(pos[1] * SCALE)), font(size, face)
        ink = rgba(color)
        if ink[3] < 255:
            if not ink[3]:
                return
            bounds = self.draw.textbbox(xy, value, font=glyph_font, anchor=anchor)
            patch = Image.new("RGBA", (bounds[2] - bounds[0], bounds[3] - bounds[1]), (0, 0, 0, 0))
            ImageDraw.Draw(patch).text((xy[0] - bounds[0], xy[1] - bounds[1]), value, font=glyph_font, fill=ink[:3] + (255,), anchor=anchor)
            patch.putalpha(patch.getchannel("A").point(lambda alpha: round(alpha * ink[3] / 255)))
            if self.opaque:
                self.image.paste(patch, bounds[:2], patch.getchannel("A"))
            else:
                self.image.alpha_composite(patch, bounds[:2])
            return
        self.draw.text(xy, value, font=glyph_font, fill=ink, anchor=anchor, stroke_width=0)

    def composite(self, other: "Canvas", opacity: float = 1):
        if opacity <= 0:
            return
        source = other.image.convert("RGBA")
        if opacity < .999:
            source = source.copy()
            source.putalpha(source.getchannel("A").point(lambda value: round(value * opacity)))
        if self.opaque:
            self.image.paste(source, (0, 0), source.getchannel("A"))
        else:
            self.image = Image.alpha_composite(self.image, source)
        self.draw = ImageDraw.Draw(self.image, "RGBA")

    def final(self) -> Image.Image:
        return self.image.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def clamp(value, low=0, high=1):
    return max(low, min(high, value))


def ease(value):
    value=clamp(value)
    return value*value*(3-2*value)


def lerp(a,b,t):
    return a+(b-a)*t


def phase_state(t):
    """A complete diagnosis, travel, repair and verification cycle."""
    t=t%SECONDS
    if t<1.8: return t,'DIAGNOSE',0,False
    if t<4.2: return t,'RESPOND',ease((t-1.8)/2.4),False
    if t<7.2: return t,'RESEAT',1,True
    if t<10.4: return t,'VERIFY',1-ease((t-7.2)/3.2),False
    return t,'MONITOR',0,False


def glow(c,x,y,r,color,alpha=1):
    for multiple,opacity in [(3.6,8),(2.2,20),(1.5,35)]:
        c.circle(x,y,r*multiple,rgba(color,round(opacity*alpha)))
    c.circle(x,y,r,rgba(color,round(245*alpha)))


def cable(c,points,color,width=1.2,alpha=1):
    c.line(points,rgba(color,round(11*alpha)),width*7)
    c.line(points,rgba(color,round(44*alpha)),width*2.5)
    c.line(points,rgba(color,round(210*alpha)),width)


def bg_gradient(top,bottom):
    c=Canvas(top)
    for y in range(HEIGHT):
        c.line([(0,y),(WIDTH,y)],mix(top,bottom,y/(HEIGHT-1)),1.1)
    return c


def iso(u,v,z=0):
    return 425+u*.91-v*.69,190+u*.30+v*.46-z


def iso_face(c,u,v,width,low,high,fill,outline=None):
    c.poly([iso(u,v,low),iso(u+width,v,low),iso(u+width,v,high),iso(u,v,high)],fill,outline,.65)


def iso_box(c,u,v,w,d,h,front='#182b36',side='#0d1d27',top='#2a404b'):
    c.poly([iso(u,v,h),iso(u+w,v,h),iso(u+w,v+d,h),iso(u,v+d,h)],rgba(top),rgba('#6e9ca4',75),.6)
    c.poly([iso(u+w,v,0),iso(u+w,v+d,0),iso(u+w,v+d,h),iso(u+w,v,h)],rgba(side),rgba('#6e9ca4',75),.6)
    c.poly([iso(u,v+d,0),iso(u+w,v+d,0),iso(u+w,v+d,h),iso(u,v+d,h)],rgba(front),rgba('#6e9ca4',105),.7)


RACKS_A=[(22,40),(119,40),(216,40),(313,40),(20,238),(115,238),(460,210)]
TARGET_A=2


def rack_iso(c,u,v,index,t,warning,repair):
    w,d,h=68,49,159
    shadow=[iso(u-3,v+8),iso(u+w+19,v+8),iso(u+w+19,v+d+24),iso(u-3,v+d+24)]
    c.poly(shadow,rgba('#02070c',160))
    iso_box(c,u,v,w,d,h)
    # Vertical rails and ten separate server/patch units.
    iso_face(c,u+4,v+d+.2,60,7,h-7,rgba('#07141c'),rgba('#3e6069',150))
    is_target=index==TARGET_A
    for slot in range(10):
        z=h-27-slot*12.9
        active_fault=is_target and slot==5 and warning>.05
        extension=math.sin(clamp((t-4.2)/3)*math.pi)*12 if repair and is_target and slot==5 else 0
        face_v=v+d+extension
        iso_face(c,u+8,face_v,52,z-8.7,z,rgba('#192f3a' if slot%3 else '#253c45'),rgba('#52717a',95))
        if extension:
            c.poly([iso(u+8,v+d,z),iso(u+60,v+d,z),iso(u+60,face_v,z),iso(u+8,face_v,z)],rgba('#738890'),rgba('#b8d0ce',150),.5)
        for hole in range(7):
            p=iso(u+12+hole*4.4,face_v+.2,z-4)
            c.line([p,(p[0]+1,p[1]-2.7)],rgba('#06121a'),.8)
        px,py=iso(u+55,face_v+.6,z-4)
        color='#ff9561' if active_fault else '#7cd8b6'
        brightness=warning if active_fault else .56+.28*math.sin(TAU*(t/SECONDS*3+slot*.12+index*.15))**2
        glow(c,px,py,1.25,color,brightness)
        if slot in (0,3,7):
            q=iso(u+10,face_v+.4,z-6)
            c.line([q,(q[0]+8,q[1]+2.4)],rgba('#82b7c0',140),.6)
    # Latches, top label and restrained front texture.
    for z in (11,145):
        x,y=iso(u+5,v+d+.6,z);c.circle(x,y,1.1,rgba('#82b7c0'))
    x,y=iso(u+9,v+d+.6,h-12)
    c.text((x,y-2),f'R{index+1:02}',6,'#c6e1dc','medium')
    x,y=iso(u+w-6,v+d+.6,h-12)
    glow(c,x,y,1.6,'#ff9561' if is_target and warning>.05 else '#78e2cb',warning if is_target and warning>.05 else .65)
    # A visible side intake grille.
    for z in range(24,137,7):
        a,b=iso(u+w+.3,v+10,z),iso(u+w+.3,v+d-8,z)
        c.line([a,b],rgba('#385361',100),.7)


def technician(c,x,y,t,travel,repair=False,front=False,orientation=1):
    # A deliberate small character: skin, hair, hoodie, belt, boots, hands and tool.
    scale=1.5 if front else 1
    step=math.sin(TAU*t*2.1)*5*travel
    bob=abs(math.sin(TAU*t*2.1))*1.8*travel
    y-=bob
    h=77*scale
    crouch=10*scale if repair and front else 0
    shoulder=y-h*.57+crouch
    head_y=y-h*.85+crouch
    skin='#dfb197';shirt='#cf775a' if front else '#7fd5cc';pants='#344452' if front else '#1e3542'
    c.ellipse((x-16*scale,y-4*scale,x+18*scale,y+5*scale),rgba('#02070e',105))
    # Legs and work boots.
    for side in (-1,1):
        hip=(x+side*5*scale,y-30*scale+crouch)
        knee=(x+side*(6+step*.3)*scale,y-17*scale)
        ankle=(x+side*(7-step*.35)*scale,y-3*scale)
        c.line([hip,knee,ankle],rgba(pants),6.5*scale)
        c.line([ankle,(ankle[0]+orientation*5*scale,ankle[1])],rgba('#09121c'),5*scale)
    # Hoodie silhouette and shoulder seams.
    c.poly([(x-13*scale,shoulder+2*scale),(x-10*scale,head_y+12*scale),(x+9*scale,head_y+12*scale),(x+14*scale,shoulder+3*scale),(x+10*scale,y-28*scale+crouch),(x-10*scale,y-28*scale+crouch)],rgba(shirt),rgba('#bde1d5' if not front else '#f1ae88',120),.8)
    c.line([(x-8*scale,shoulder+10*scale),(x+10*scale,shoulder+10*scale)],rgba('#e8d9aa',200),1.6*scale)
    c.line([(x-10*scale,y-29*scale+crouch),(x+10*scale,y-29*scale+crouch)],rgba('#16242b'),4*scale)
    c.rect((x+4*scale,y-31*scale+crouch,x+9*scale,y-25*scale+crouch),rgba('#8c9b9d'),radius=.7*scale)
    # Head and asymmetric hair give a clear facing direction.
    c.ellipse((x-7.5*scale,head_y-8*scale,x+7.5*scale,head_y+9*scale),rgba(skin))
    c.poly([(x-8*scale,head_y),(x-7*scale,head_y-9*scale),(x+5*scale,head_y-10*scale),(x+9*scale,head_y-4*scale),(x+orientation*4*scale,head_y-1*scale),(x-orientation*6*scale,head_y+1*scale)],rgba('#18232d'))
    c.circle(x+orientation*4*scale,head_y+1.5*scale,.8*scale,rgba('#23313b'))
    # Working arm is extended toward a rack module or connector.
    if repair:
        arm=[(x+orientation*10*scale,shoulder+3*scale),(x+orientation*20*scale,shoulder-3*scale),(x+orientation*(29+math.sin(t*TAU)*1.7)*scale,shoulder-(15 if front else 30)*scale)]
    elif travel:
        arm=[(x+orientation*11*scale,shoulder+4*scale),(x+orientation*(12-step*.4)*scale,shoulder+16*scale),(x+orientation*(15-step*.65)*scale,shoulder+27*scale)]
    else:
        arm=[(x+orientation*11*scale,shoulder+4*scale),(x+orientation*21*scale,shoulder+8*scale),(x+orientation*27*scale,shoulder-2*scale)]
    c.line(arm,rgba(shirt),5.5*scale)
    c.circle(*arm[-1],2.5*scale,rgba(skin))
    c.line([(x-orientation*10*scale,shoulder+4*scale),(x-orientation*14*scale,shoulder+23*scale)],rgba(shirt),5*scale)
    c.circle(x-orientation*14*scale,shoulder+24*scale,2.4*scale,rgba(skin))
    # A compact service tool, never a weapon silhouette.
    if repair:
        tip=arm[-1];c.line([tip,(tip[0]+orientation*6*scale,tip[1]-2*scale)],rgba('#d8e5e0'),1.4*scale)
        c.circle(tip[0]+orientation*7*scale,tip[1]-2*scale,1.2*scale,rgba('#89ebcf'))
    elif travel:
        a,b=x-orientation*23*scale,x-orientation*11*scale
        c.rect((min(a,b),y-22*scale,max(a,b),y-12*scale),rgba('#a86647'),rgba('#dbab77'),.7*scale,radius=1.5*scale)


BG_A=bg_gradient('#07121b','#081d27')


def scene_a(t):
    t,stage,position,repair=phase_state(t)
    c=Canvas('#07121b');c.composite(BG_A)
    phi=TAU*t/SECONDS
    # Distant wall and overhead services frame the floor, rather than a poster title.
    for x in range(60,940,55):
        c.line([(x,78),(x+23,253)],rgba('#386073',18),.6)
    c.line([(75,128),(897,128)],rgba('#84adba',22),.8)
    c.text((42,31),'SUB / THE MAINTENANCE WINDOW',10,'#d6e9e3','medium')
    c.text((918,32),'ILLUSTRATED FIELD STUDY 01',8,'#789ca7',anchor='rt')
    floor=[iso(-70,-10),iso(550,-10),iso(550,330),iso(-70,330)]
    c.poly(floor,rgba('#0d2934'),rgba('#325560',110),.7)
    for u in range(-70,551,45):c.line([iso(u,-10),iso(u,330)],rgba('#42717d',65),.55)
    for v in range(-10,331,45):c.line([iso(-70,v),iso(550,v)],rgba('#42717d',65),.55)
    # A cable tray glows softly above the aisle.
    cable(c,[iso(15,23,174),iso(400,23,174),iso(400,115,174)],'#4f979d',1.1,.7)
    for u in (60,157,254,351):
        c.line([iso(u,23,174),iso(u,54,159)],rgba('#69a6a7',130),1.1)
    # Floor path lights help the eye follow the technician.
    for i in range(18):
        x=320+i*16;y=375-(i/17)*39
        alpha=35+round(70*(.5+.5*math.sin(phi*2-i*.4)))
        c.circle(x,y,1.25,rgba('#6fc8c8',alpha))
    warning=1 if t<6.9 or t>11.1 else 0
    if 10.5<t<=11.1:warning=ease((t-10.5)/.6)
    if 6.5<t<6.9:warning=1-ease((t-6.5)/.4)
    # The rear bank remains visible; the front bank is drawn later for depth.
    for i,(u,v) in enumerate(RACKS_A[:4]):rack_iso(c,u,v,i,t,warning,repair)
    # KVM cart: screen, base, swivel stand, keyboard and rolling feet.
    c.poly([(172,320),(287,320),(306,333),(188,333)],rgba('#38525c'),rgba('#7d9ea2',150),.7)
    c.line([(239,329),(239,375)],rgba('#466370'),7)
    c.line([(207,380),(271,380)],rgba('#304957'),5)
    c.line([(217,376),(207,389),(202,389)],rgba('#476673'),3)
    c.line([(259,376),(271,389),(276,389)],rgba('#476673'),3)
    c.circle(204,391,3,rgba('#06131b'));c.circle(274,391,3,rgba('#06131b'))
    c.rect((167,224,298,313),rgba('#334c55'),rgba('#7fa8af',180),1,radius=4)
    c.rect((174,231,291,304),rgba('#061219'),rgba('#071d26'),.6,radius=1)
    screen_color='#f8a36f' if warning>.05 else '#8de2c3'
    c.text((182,240),'KVM / RACK 03',8,'#80b7bd','medium')
    c.line([(182,254),(282,254)],rgba('#31515b'),.7)
    c.text((182,264),'LINK LOSS' if warning>.05 else 'LINK VERIFIED',10,screen_color,'medium')
    c.text((182,282),'inspect module' if stage in ('DIAGNOSE','RESPOND') else 'reseating...' if repair else 'signal restored' if not warning else 'next alert',6.5,'#9cc0c4')
    if int(t*1.4)%2==0:c.rect((276,291,280,294),rgba('#9bd7cf'))
    for y in range(322,329,2):c.line([(189,y),(280,y)],rgba('#9fb2af',70),.5)
    # Cables tie the cart into the physical rack bank.
    cable(c,[(297,279),(320,287),(340,309),(438,309),(500,282),(614,282)],'#499391',.8,.5)
    tx=lerp(325,594,position);ty=lerp(373,329,position)
    travel=1 if stage in ('RESPOND','VERIFY') and .01<position<.99 else 0
    technician(c,tx,ty,t,travel,repair,False,1 if stage!='VERIFY' else -1)
    # The nearest racks produce real occlusion and bring foreground to the shot.
    for i,(u,v) in enumerate(RACKS_A[4:],4):rack_iso(c,u,v,i,t,0,False)
    # Small operational narration belongs to the scene, not a full-frame title.
    c.rect((730,355,918,442),rgba('#09232dbf'),rgba('#355b64'),.7,radius=2)
    c.text((743,368),'R03 / SERVICE LOG',7,'#86b5ba','medium')
    c.text((743,386),{'DIAGNOSE':'Read the warning.','RESPOND':'Follow the fault.','RESEAT':'Reseat the module.','VERIFY':'Verify the signal.','MONITOR':'Return to the console.'}[stage],10,'#d2e6df','medium')
    c.text((743,407),'LINK  /  '+('CHECK' if warning>.05 else 'CLEAR'),7,screen_color)
    for i in range(3):
        c.rect((743+i*50,426,779+i*50,428),rgba(screen_color,160 if i<=int(t/4) else 30))
    c.line([(41,493),(919,493)],rgba('#7ba5ad',65),.7)
    c.text((42,507),'KVM  →  DIAGNOSE  →  RESEAT  →  VERIFY',8,'#92b7bb','medium')
    c.text((918,507),'GENERATED SCENE / NO CLIENT SYSTEMS',7,'#628c99',anchor='rt')
    return c.final()


BG_B=bg_gradient('#171b2b','#0b1220')


def front_rack(c,x,y,width,height,label,t,fault=False,warning=1,repair=False):
    c.poly([(x+width,y),(x+width+18,y-10),(x+width+18,y+height-8),(x+width,y+height)],rgba('#142438'),rgba('#456070',80),.7)
    c.poly([(x,y),(x+18,y-10),(x+width+18,y-10),(x+width,y)],rgba('#405266'),rgba('#6d7c88',100),.7)
    c.rect((x,y,x+width,y+height),rgba('#26384b'),rgba('#66828d',130),1,radius=2)
    c.rect((x+8,y+11,x+width-8,y+height-10),rgba('#0c1828'),rgba('#56737f',120),.7,radius=1)
    c.text((x+17,y+19),label,8,'#bacfd2','medium')
    for row in range(9):
        yy=y+43+row*27
        c.rect((x+17,yy,x+width-17,yy+21),rgba('#24384b' if row%3 else '#304b5b'),rgba('#688892',80),.6,radius=1)
        # Rack handles and grille vents.
        for side in (x+20,x+width-23):c.line([(side,yy+5),(side,yy+16)],rgba('#9bb2b2',140),1)
        if row in (0,4):
            for port in range(12):
                px=x+28+port*10.6
                c.rect((px,yy+5,px+7,yy+13),rgba('#0b1826'),rgba('#678f91',150),.5)
                color='#f4a36e' if fault and row==4 and port in (7,8) and warning>.1 else '#71d3bb'
                glow(c,px+3.5,yy+16,.7,color,.7)
        else:
            for vent in range(20):
                px=x+32+vent*5.2
                c.line([(px,yy+6),(px,yy+15)],rgba('#08131f'),1)
            for led in range(3):
                px=x+width-32-led*7;alpha=.45+.5*math.sin(TAU*t/SECONDS*3+row*.2+led)**2
                glow(c,px,yy+10.5,1.05,'#f69c6a' if fault and row==7 and warning>.1 else '#72d7c1',alpha)
        # One lower hot-swap panel visibly moves outward during the repair.
        if fault and row==7 and repair:
            pull=math.sin(clamp((t-4.2)/3)*math.pi)*9
            c.poly([(x+22,yy+2),(x+width-23,yy+2),(x+width-23+pull,yy+2+pull*.4),(x+22+pull,yy+2+pull*.4)],rgba('#7c929b'),rgba('#c2d7d1'),.6)
    c.circle(x+width-12,y+height*.54,2.6,rgba('#789c9f'))
    c.line([(x+12,y+height-5),(x+width-12,y+height-5)],rgba('#aeb7ad',90),1.5)


def arc_path(a,b,height,samples=30):
    return [(lerp(a[0],b[0],i/(samples-1)),lerp(a[1],b[1],i/(samples-1))-math.sin(i/(samples-1)*math.pi)*height) for i in range(samples)]


def scene_b(t):
    t,stage,position,repair=phase_state(t)
    phi=TAU*t/SECONDS
    c=Canvas('#171b2b');c.composite(BG_B)
    # Wall panels and a perspective floor support a frontal service-bay view.
    for x in range(22,960,82):c.line([(x,73),(x,402)],rgba('#7a7f9b',21),.7)
    c.rect((0,401,960,494),rgba('#101b2d'))
    for x in range(-400,1400,100):c.line([(480,330),(x,495)],rgba('#768fa1',25),.7)
    for y in (409,423,443,468,493):c.line([(0,y),(960,y)],rgba('#768fa1',35),.6)
    warning=1 if t<6.9 or t>11.1 else 0
    if 10.5<t<=11.1:warning=ease((t-10.5)/.6)
    if 6.5<t<6.9:warning=1-ease((t-6.5)/.4)
    # A substantial bank of hardware, not a text-led advert.
    front_rack(c,72,95,186,306,'EDGE / FIBER',t,True,warning,repair)
    front_rack(c,337,95,186,306,'COMPUTE / KVM',t,False,warning,False)
    front_rack(c,688,95,186,306,'STORAGE / CORE',t,False,warning,False)
    # Raised fiber/network routes, following the actual patch bays.
    color='#e59b77' if warning>.1 else '#85dec5'
    for offset in (-8,0,8):
        points=arc_path((216+offset,247),(460+offset,247),170-abs(offset)*2)
        cable(c,points,color,.85,.65)
        points2=arc_path((466+offset,247),(784+offset,247),158-abs(offset)*2)
        cable(c,points2,'#6aafca',.85,.6)
    # Signal photons run along the route at a quiet, continuous cadence.
    points=arc_path((216,247),(460,247),170)
    for j in range(3):
        u=((t/SECONDS*2)+j/3)%1;idx=min(len(points)-1,int(u*(len(points)-1)))
        if warning>.1 and .38<u<.55:continue
        glow(c,*points[idx],1.6,color,.85)
    # Side KVM station and monitor diagnostic frame.
    c.poly([(548,330),(680,330),(696,342),(558,342)],rgba('#4f6172'),rgba('#829aa1'),.7)
    c.line([(622,342),(622,431)],rgba('#40576b'),8)
    c.line([(580,435),(666,435)],rgba('#30455c'),5)
    c.circle(582,440,4,rgba('#07111e'));c.circle(666,440,4,rgba('#07111e'))
    c.rect((539,229,689,323),rgba('#3b5166'),rgba('#93b1b5',200),1,radius=4)
    c.rect((546,236,682,316),rgba('#081724'),radius=1)
    c.text((555,245),'KVM / PORT 08',8,'#90c9ce','medium')
    c.text((555,262),'CRC / LINK DOWN' if warning>.1 else 'LINK / STABLE',10,color,'medium')
    c.line([(555,282),(674,282)],rgba('#285060'),.6)
    waveform=[]
    for i in range(90):
        u=i/89;yy=296+math.sin(u*TAU*3-phi*4)*(5 if warning>.1 else 2.5)
        if warning>.1 and .42<u<.62:yy=296
        waveform.append((555+u*119,yy))
    cable(c,waveform,color,.8,.7)
    c.text((555,308),'trace → reseat → verify',5.5,'#9cbcc6')
    # Cable service loop leads the eye to the lower physical module.
    service=[(232,347),(275,360),(279,408),(390,424),(512,417),(547,301)]
    cable(c,service,color,1.2,.65)
    # Amber warning and green verification remain located on the hardware.
    if warning>.1:
        c.poly([(269,120),(275,132),(263,132)],rgba('#f2b17b',round(200*warning)))
        c.text((269,124),'!',5,'#172536','medium',anchor='mt')
    else:
        c.circle(269,126,6,rgba('#7ee0bb',210));c.line([(266,126),(268,128),(272,123)],rgba('#10312f'),1.3)
    tx=lerp(523,260,position);ty=453
    travel=1 if stage in ('RESPOND','VERIFY') and .01<position<.99 else 0
    technician(c,tx,ty,t,travel,repair,True,-1 if stage!='VERIFY' else 1)
    # A bench tray appears at human scale beside the service area.
    c.rect((290,438,324,449),rgba('#52727d'),rgba('#8eb2b0'),.7,radius=2)
    c.line([(296,443),(316,443)],rgba('#d0c8b3'),1.4)
    c.circle(319,443,2,rgba('#c68762'))
    c.text((42,31),'SUB / FOLLOW THE SIGNAL',10,'#dfdfe2','medium')
    c.text((918,32),'ILLUSTRATED FIELD STUDY 02',8,'#9695ad',anchor='rt')
    c.rect((343,63,566,81),rgba('#233247'),rgba('#5f7d8a',100),.5,radius=2)
    c.text((354,68),stage+' / '+('FAULT ISOLATED' if warning>.1 else 'VERIFICATION COMPLETE'),7,'#c6d6d6','medium')
    c.line([(42,493),(918,493)],rgba('#8e9fb5',65),.7)
    c.text((42,507),'FIBER / NETWORK / HARDWARE / DIAGNOSTICS',8,'#a3b4c5','medium')
    c.text((918,507),'GENERATED SCENE / NO CLIENT SYSTEMS',7,'#73859e',anchor='rt')
    return c.final()


def inspect(path,ffprobe):
    response=subprocess.run([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(path)],capture_output=True,text=True,check=True)
    data=json.loads(response.stdout);video=next(s for s in data['streams'] if s['codec_type']=='video')
    assert video['width']==WIDTH and video['height']==HEIGHT
    assert video['codec_name']=='h264' and video['pix_fmt']=='yuv420p'
    assert video['avg_frame_rate']==f'{FPS}/1' and int(video['nb_frames'])==FPS*SECONDS
    assert not any(s['codec_type']=='audio' for s in data['streams'])
    assert abs(float(data['format']['duration'])-SECONDS)<.05
    raw=path.read_bytes();assert raw.index(b'moov')<raw.index(b'mdat')
    return {'width':WIDTH,'height':HEIGHT,'duration':float(data['format']['duration']),'fps':FPS,'codec':'h264','pixelFormat':'yuv420p','audio':False,'bytes':len(raw),'faststart':True,'frameCount':int(video['nb_frames']),'sha256':hashlib.sha256(raw).hexdigest()}


def encode(name,renderer,ffmpeg,ffprobe,replace=False):
    video=ASSETS/f'tech-ad-{name}.mp4';poster=ASSETS/f'tech-ad-{name}.jpg'
    if (video.exists() or poster.exists()) and not replace:
        raise SystemExit(f'Preserving {video.name}; --replace replaces only this renderer’s named new-portfolio assets.')
    assert renderer(0).tobytes()==renderer(SECONDS).tobytes(),name+' endpoint mismatch'
    poster_frame=renderer(4.9 if name=='backbone' else 5.8)
    poster_frame.save(poster,quality=92,subsampling=0,optimize=True)
    encoder=subprocess.Popen([ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{WIDTH}x{HEIGHT}','-framerate',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','21','-maxrate','1500k','-bufsize','3000k','-pix_fmt','yuv420p','-movflags','+faststart','-metadata','comment=Original illustrated datacenter-maintenance scene for Sub; generated test media.',str(video)],stdin=subprocess.PIPE)
    try:
        for i in range(FPS*SECONDS):
            encoder.stdin.write(renderer(i/FPS).tobytes())
            if i%90==0:print(f'{name}: {i}/{FPS*SECONDS} frames',flush=True)
        encoder.stdin.close()
        if encoder.wait()!=0:raise RuntimeError('FFmpeg failed')
    except BaseException:
        encoder.kill();encoder.wait();raise
    result=inspect(video,ffprobe)
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-i',str(video),'-f','null','-'],check=True)
    result.update(video=video.name,poster=poster.name,loop=True,original=True,loopEndpointVerified=True,fullDecodeVerified=True)
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--replace',action='store_true',help='Replace only the named new-portfolio tech-ad MP4/JPG/JSON outputs.')
    parser.add_argument('--posters-only',action='store_true',help='Render and inspect poster JPGs only; existing JPGs require --replace.')
    args=parser.parse_args();ASSETS.mkdir(parents=True,exist_ok=True)
    ffmpeg=shutil.which('ffmpeg');ffprobe=shutil.which('ffprobe')
    if not ffmpeg or not ffprobe:raise SystemExit('Existing FFmpeg and FFprobe are required; nothing is installed.')
    if args.posters_only:
        for name,renderer,tt in [('backbone',scene_a,4.9),('restore',scene_b,5.8)]:
            target=ASSETS/f'tech-ad-{name}.jpg'
            if target.exists() and not args.replace:raise SystemExit('Preserving existing poster. Use --replace for these new-portfolio files only.')
            renderer(tt).save(target,quality=92,subsampling=0,optimize=True)
            print(target)
        return
    result={'generator':'render-datacenter-films.py','attribution':'Original procedural datacenter and technician illustrations created for Sub; rendered locally with Pillow and FFmpeg.','notes':'Generated maintenance scenes, not recordings of client systems. Silent periodic motion, no rapid full-field flashing.','clips':[]}
    for name,renderer,title,description in [('backbone',scene_a,'The Maintenance Window','An isometric rack aisle: a technician reads a KVM warning, follows the fault, reseats a server module and verifies the restored signal.'),('restore',scene_b,'Follow the Signal','A front-facing network service bay: fiber paths, rack alerts and a KVM diagnostic lead a technician through a physical repair and verification.')]:
        clip=encode(name,renderer,ffmpeg,ffprobe,args.replace);clip.update(title=title,description=description);result['clips'].append(clip)
        print(f'{clip["video"]}: {clip["bytes"]:,} bytes, {clip["duration"]}s, clean decode',flush=True)
    (ASSETS/'tech-ads.json').write_text(json.dumps(result,indent=2)+'\n')


if __name__=='__main__':main()


