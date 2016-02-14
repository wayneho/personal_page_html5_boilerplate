Sky sky;

void setup(){

  // dynamically resize canvas
  doResize();
  frameRate(33);

}

void draw() {

  // translated origin to bottom right corner
  translate(width,height);

  // flip coordinate system on x and y axis
  scale(-1,-1);

  if(canvas.start){
    background(0,0);
    sky.run();
  }
}

class Sky{
  Star[] stars;

  // initialize number of stars to draw
  Sky(int num){
    stars = new Star[num];
    for(int i = 0; i < stars.length; i++){
      stars[i] = new Star();
    }
  }

  // display stars
  void run(){
    for(int i = 0; i< stars.length -1; i++){
      stars[i].run();
    }
  }

}

class Star{
  PVector location;
  PVector velocity;
  float brightness;
  float size;
  float weight;

  Star(){
    velocity = new PVector(0.5,0);
    location = new PVector(random(-width/2,width),random(0,height*1.5));
    size = random(0.01,3);
    brightness = random(50,255);
    weight = random(0.01,0.5);
  }

  void run(){
    update();
    display();
    if(isDead()){
      relocate();
    }
  }

  // Method to update location
  void update(){
    location.add(velocity);
    location.rotate(radians(-0.1));
  }

  // Method to display
  void display() {
    //stroke(33,68,255,brightness);
    //strokeWeight(weight);

    // no stroke gives better fps
    noStroke();
    fill(255,255,255,brightness);
    ellipse(location.x,location.y,size,size);
  }

  // randomly place star on the top side or right side of the screen
  void relocate(){
    float ratio = width/height;
    float x = random(0,1+ratio);

    if(x < ratio)
      location = new PVector(random(0,width),random(height,height*1.5));
    else
      location = new PVector(random(-width/2,0),random(0,height));
  }

  // Is the star still visible within the screen size?
  boolean isDead() {
    if (location.x > width || location.y < 0) {
      return true;
    } else {
      return false;
    }
  }
}

function doResize()
{
  var width = $(window).width();
  //var setupHeight = Math.max($(document).height(), $(window).height());
  setupHeight = $(window).height();
  $('#background-animation').width($(window).width());
  $('#background-animation').height(setupHeight);

  size(width, setupHeight);

  sky = new Sky(width);
}
$(window).resize(doResize);
