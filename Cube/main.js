canvas = document.getElementById("canvas");
c = canvas.getContext("2d");
keys = [];
objects = [];
keybinds = [];
speed = {x: 1,y:1,z:1};
camera = new Camera(0,0,0,canvas.width / 2,canvas.height / 2);
fr = 60;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
background = new Pixel(0,25,255);
new Cube(0, 0, 100,50);
cubeFaces = [
  [0,1,2,3],
  [1,5,6,2],
  [7,6,5,4],
  [3,7,4,0],
  [4,5,1,0],
  [3,2,6,7]
];

cubeTris = [
    [0,1,3],
    [2,3,1],
    [1,5,2],
    [6,2,5],
    [5,4,6],
    [7,6,4],
    [4,0,7],
    [3,7,0],
    [5,0,4],
    [1,0,5],
    [7,3,6],
    [6,3,2]
];

    var pen = new Pen();
    pen.r = 255;
    pen.g = 255;
    pen.b = 255;
    var lastLoop = new Date();
    var fps = 0;
    var te = {x: 20,y: 69};
setInterval(function(){
    checkKeys();
    var thisLoop = new Date();
    fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;
    beginFrame();
    
    cls();
    for(let i = 0; i < objects.length; i++){
        objects[i].update();
        draw(objects[i]);
    }
    //pen.fillTriangle(new Point2d(21,20), te,new Point2d(10,10), 0, 255, 0);
    endFrame();
    camera.focalPoint = new Point2d(canvas.width / 2, canvas.height / 2);
    lastLoop = thisLoop;
} , 1000 / fr);
function Pen(){
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.moveTo = function(mx,my){
        this.x = Math.round(mx);
        this.y = Math.round(my);
    };
    this.lineTo = function(mx,my){
        mx = Math.round(mx);
        my = Math.round(my);
        let dx = Math.abs(mx - this.x);
        let dy = -Math.abs(my - this.y);
        let sx = this.x < mx ? 1 : -1;
        let sy = this.y < my ? 1 : -1;
        let e = dx + dy;
        while(true){
            if(this.x === mx && this.y === my){
                break;
            }
            if(this.x > 0){
                if(this.x < canvas.width){
                    if(this.y > 0){
                        if(this.y < canvas.height){
                            setPixel(this.x,this.y,this.r,this.g,this.b);
                        }
                    }
                }
            }
            let e2 = e * 2;
            if(e2 >= dy){
                e += dy;
                this.x += sx;
            }
            if(e2 <= dx){
                e += dx;
                this.y += sy;
            }
            
        }
        this.x = mx;
        this.y = my;
    };
    this.fillTriangle = function(p0,p1,p2,r,g,b){ // welcome to the worst possible approach to filling triangles probably
        let h = p0;
        let m = p1;
        let l = p2;
        if(h.y > m.y){let hold = m;m = h;h = hold;} // sorts from highest to lowest
        if(m.y > l.y){let hold = m;m = l;l = hold;}
        if(h.y > m.y){let hold = m;m = h;h = hold;}
        if(h.y === m.y){ // if its a flat top
            penhelper.fillFlatTop(h,m,l,r,g,b);
        }
        else if(m.y === l.y){ //if its a flat bottom
            penhelper.fillFlatBottom(h,m,l,r,g,b);
        }
        else{ //if it's not a flat top or bottom
                let split = new Point2d(h.x + ((m.y - h.y) / (l.y - h.y)) * (l.x - h.x), m.y);
                penhelper.fillFlatBottom(h,m,split,r,g,b);
                penhelper.fillFlatTop(split,m,l,r,g,b);
        }
    };
};
class penhelper{
    static fillFlatBottom = function(top,middle,bottom,r,g,b){
        if(bottom.x > middle.x){let hold = middle;middle = bottom;bottom = hold;}
        let sl = (top.x - bottom.x) / (top.y - bottom.y);
        let sr = (top.x - middle.x) / (top.y - middle.y);
        let sx = Math.ceil(top.x - 0.5);
        let ex = Math.ceil(top.x - 0.5);
        let sy = Math.ceil(top.y - 0.5);
        let ey = Math.ceil(bottom.y - 0.5);
        while(sy < ey){
            sx = Math.ceil(sl * (sy - top.y + 0.5) + top.x - 0.5);
            ex = Math.ceil(sr * (sy - top.y + 0.5) + top.x - 0.5);
            for(let cx = sx; cx < ex; cx++){
                if(cx < canvas.width){
                    if(cx > 0){
                        setPixel(cx, sy, r, g, b);
                    }
            }
            }
            sy++;
        }
    };
    static fillFlatTop = function(top,middle,bottom,r,g,b){
        if(top.x > middle.x){let hold = middle;middle = top;top = hold;}
        let sl = (bottom.x - top.x) / (bottom.y - top.y);
        let sr = (bottom.x - middle.x) / (bottom.y - middle.y);
        let sx = Math.ceil(top.x - 0.5);
        let ex = Math.ceil(middle.x - 0.5);
        let sy = Math.ceil(top.y - 0.5);
        let ey = Math.ceil(bottom.y - 0.5);
        while(sy < ey){
            sx = Math.ceil(sl * (sy - top.y + 0.5) + top.x - 0.5);
            ex = Math.ceil(sr * (sy - middle.y + 0.5) + middle.x - 0.5);
            for(let cx = sx; cx < ex; cx++){
                if(cx < canvas.width){
                    if(cx > 0){
                        setPixel(cx, sy, r, g, b);
                    }
                }
            }
            sy++;
        }
};
} //subscribe to chilitomatonoodle
function cls(){
    for(let y = 0; y < canvas.height; y++){
        for(let x = 0; x < canvas.width; x++){
            setPixel(x,y,background.r,background.g,background.b);
        }
    }
}
function beginFrame(){
    id = c.createImageData(canvas.width,canvas.height);
}
function Pixel(r,g,b){
    this.r = r;
    this.g = g;
    this.b = b;
}
function getPixel(x,y){
    x *= 4;
    y *= canvas.width * 4;
    return new Pixel(id.data[x + y], id.data[x + y + 1], id.data[x + y + 2]); 
}
function setPixel(x,y,r,g,b){
    x *= 4;
    y *= canvas.width * 4;
    id.data[x + y] = r;
    id.data[x + y + 1] = g;
    id.data[x + y + 2] = b;
    id.data[x + y + 3] = 255;
}
function endFrame(){
    c.putImageData(id,0,0);
} 
function rotateX(obj, rad){
  //Thanks to Mt. Ford Studios for the epic video
  for(let i = 0; i < obj.points.length; i++){
    let point = obj.points[i];
    let ox = point.x - obj.x;
    let oz = point.z - obj.z;
    pos(obj.points[i],obj.x - oz * Math.sin(rad) + ox * Math.cos(rad), point.y, obj.z + oz * Math.cos(rad) + ox * Math.sin(rad));
}}
function rotateY(obj, rad){
  for(let i = 0; i < obj.points.length; i++){
    let point = obj.points[i];
    let oy = point.y - obj.y;
    let oz = point.z - obj.z;
    pos(point,point.x, obj.y + oy * Math.cos(rad) - oz * Math.sin(rad), obj.z + oy * Math.sin(rad) + oz * Math.cos(rad));
}}
function rotateZ(obj, rad){
    for(let i = 0; i < obj.points.length; i++){
    let point = obj.points[i];
    let ox = point.x - obj.x;
    let oy = point.y - obj.y;
    pos(obj.points[i], obj.x + ox * Math.cos(rad) - oy * Math.sin(rad), obj.y + ox * Math.sin(rad) + oy * Math.cos(rad),point.z);
}}
function Vector(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}
function magnitude(vec){
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}
function Point2d(x,y){
    this.x = x;
    this.y = y;
}
function project(point){
    let x = point.x - camera.x; let y = point.y - camera.y; let z = point.z - camera.z;
    let dx = Math.cos(camera.yaw) * (Math.sin(camera.roll) * y + Math.cos(camera.roll) * x) - Math.sin(camera.yaw) * z;
    let dy = Math.sin(camera.pitch) * (Math.cos(camera.yaw) * z + Math.sin(camera.yaw) * (Math.sin(camera.roll) * y + Math.cos(camera.roll) * x)) + Math.cos(camera.pitch) * (Math.cos(camera.roll) * y - Math.sin(camera.roll * x));
    let dz = Math.cos(camera.pitch) * (Math.cos(camera.yaw) * z + Math.sin(camera.yaw) * (Math.sin(camera.roll) * y + Math.cos(camera.roll) * x)) - Math.sin(camera.pitch) * (Math.cos(camera.roll) * y - Math.sin(camera.roll * x));
    return new Point2d((dx * canvas.width) / dz + camera.focalPoint.x,(dy * canvas.width) / dz + camera.focalPoint.y);
}
function draw(obj){
    for(let tri = 0; tri < 12; tri++){
        let renderFace = true;
        if(dp(sv(obj.points[cubeTris[tri][0]], camera.posVector()), normal(obj, tri)) >= 0){
            renderFace = false;
        }
        if(renderFace){
            let fc = project(obj.points[cubeTris[tri][0]]);
            pen.moveTo(fc.x,fc.y);
            if(tri % 2 === 1){
            pen.fillTriangle(project(obj.points[cubeTris[tri][0]]),project(obj.points[cubeTris[tri][1]]),project(obj.points[cubeTris[tri][2]]),255,0,0);
        }
        else{
            pen.fillTriangle(project(obj.points[cubeTris[tri][0]]),project(obj.points[cubeTris[tri][1]]),project(obj.points[cubeTris[tri][2]]),0,255,0);
        }
            for(let corner = 1; corner < 4; corner++){
                let point = project(obj.points[cubeTris[tri][corner % 3]]);
                pen.lineTo(point.x,point.y);
            }
        }
        }
}
function normalize(v){
    let m = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return new Vector(v.x / m, v.y / m, v.z / m);
}
function dp(v1,v2){
    return(v1.x * v2.x  +  v1.y * v2.y  +  v1.z * v2.z);
}
function cp(v1,v2){ //returns the cross product of 2 vectors
    return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}
function sv(v1,v2){
    return(new Vector(v1.x - v2.x,v1.y - v2.y,v1.z - v2.z));
}
function av(v1,v2){
    return(new Vector(v1.x + v2.x,v1.y + v2.y,v1.z + v2.z));
}
function scalev(v1,s){
    return(new Vector(v1.x * s, v1.y * s, v1.z * s));
}
function normal(cube,tri){
    let v0 = new Vector(cube.points[cubeTris[tri][0]].x, cube.points[cubeTris[tri][0]].y, cube.points[cubeTris[tri][0]].z);
    let v1 = new Vector(cube.points[cubeTris[tri][1]].x, cube.points[cubeTris[tri][1]].y, cube.points[cubeTris[tri][1]].z);
    let v2 = new Vector(cube.points[cubeTris[tri][2]].x, cube.points[cubeTris[tri][2]].y, cube.points[cubeTris[tri][2]].z);
    return(cp(sv(v1, v0), sv(v2, v0)));
}
function Point3d(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}
function Camera(x,y,z,fx,fy){
this.focalPoint = new Point2d(fx,fy);
this.yaw = 0;
this.pitch = 0;
this.roll = 0;
this.x = x;
this.y = y;
this.z = z;
this.posVector = function(){
    return(new Vector(this.x, this.y, this.z));
};
this.lookVector = function(){
    return(new Vector(Math.sin(this.yaw), Math.sin(this.pitch), Math.sin(this.roll)));
};
}
function Cube(x,y,z,wX,wY,wZ){
    this.wX = wX;
    if(!wY){this.wY = wX;}else{this.wY = wY / 2;}
    if(!wZ){this.wZ = wX;}else{this.wZ = wZ / 2;}
    this.x = x;
    this.y = y;
    this.z = z;
    this.rVX = 0;
    this.rVY = 0;
    this.points = [
        new Point3d(this.x - this.wX / 2, this.y - this.wY / 2, this.z + this.wZ / 2),
        new Point3d(this.x + this.wX / 2, this.y - this.wY / 2, this.z + this.wZ / 2),
        new Point3d(this.x + this.wX / 2, this.y + this.wY / 2, this.z + this.wZ / 2),
        new Point3d(this.x - this.wX / 2, this.y + this.wY / 2, this.z + this.wZ / 2),
        new Point3d(this.x - this.wX / 2, this.y - this.wY / 2, this.z - this.wZ / 2),
        new Point3d(this.x + this.wX / 2, this.y - this.wY / 2, this.z - this.wZ / 2),
        new Point3d(this.x + this.wX / 2, this.y + this.wY / 2, this.z - this.wZ / 2),
        new Point3d(this.x - this.wX / 2, this.y + this.wY / 2, this.z - this.wZ / 2)
    ];
    this.update = function(){
        rotateX(this, this.rVX);
        rotateY(this, this.rVY);
    };
    objects.push(this);
}
function pos(point,x,y,z){
    point.x = x;
    point.y = y;
    point.z = z;
}
function keybind(key, onPress){
    this.key = key;
    this.onPress = onPress;
    keybinds.push(this);
}
function checkKeys(){
    for(j = 0; j < keybinds.length; j++){
        if(keys.includes(keybinds[j].key)){
            keybinds[j].onPress();
        }
    }
    if(!document.hasFocus()){
        keys = [];
    }
}
window.addEventListener("keydown", function(event){
    if(!keys.includes(event.key)){
        keys.push(event.key);
    }
});
window.addEventListener("keyup", function(event){
    if(keys.includes(event.key)){
    keys.splice(keys.indexOf(event.key), 1);
}
});
new keybind("w", function(){
  camera.x += Math.sin(camera.yaw);
  camera.z += Math.cos(camera.yaw);
});
new keybind("s", function(){
  camera.x -= Math.sin(camera.yaw);
  camera.z -= Math.cos(camera.yaw);
});
new keybind("a", function(){
  camera.x -= Math.cos(camera.yaw);
  camera.z += Math.sin(camera.yaw);
});
new keybind("d", function(){
  camera.x += Math.cos(camera.yaw);
  camera.z -= Math.sin(camera.yaw);
});
new keybind("ArrowLeft", function(){
  camera.yaw -= 0.010;
});
new keybind("ArrowRight", function(){
  camera.yaw += 0.010;
});
new keybind("ArrowUp", function(){
  camera.pitch += 0.010;
});
new keybind("ArrowDown", function(){
  camera.pitch -= 0.010;
});
new keybind("q", function(){
  camera.y += speed.y;
});
new keybind(" ", function(){
  camera.y -= speed.y;
});
new keybind("u", function(){
  te.y -= 1;
});
new keybind("j", function(){
  te.y += 1;
});
new keybind("h", function(){
  te.x -= 1;
});
new keybind("k", function(){
  te.x += 1;
});
window.addEventListener("resize", function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
canvas.oncontextmenu = function(){return false;};