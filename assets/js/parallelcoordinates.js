String[] data;
String[] colNames;
String fileName = "assets/data/tractDataFinalProject.csv";
float[] mins;
float[] maxes;
float lineWidthIncrement;
int dataLen;
float frameWidth;
float marginX;
float frameHeight;
float topMargin;
float bottomMargin;
float[][] dataPositions;
PFont f;
int fontSize;
PGraphics backBuffer;
float rectangleAnchorX;
float rectangleAnchorY;
boolean rectangleSelection;
int[] orientations;
color gradientColor1 = color(255.0,0.0,0.0);
color gradientColor2 = color(255.0,255.0,0);
boolean[] colorSelectionModes;
boolean[] dimensionSelected;
float[] topKnobHeights;
float[] bottomKnobHeights;
boolean[] togglingTop;
boolean[] togglingBottom;
boolean togglesHaveChanged;
boolean[] beingDragged;
float[] means = new float[9];
means[0] = 0.0;
means[0] = 0.469630883;
means[1] = 0.287798114;
means[2] = 0.257007646;
means[3] = 0.182726792;
means[4] = 0.260380748;
means[5] = 0.299778459;
means[6] = 0.04290329;
means[7] = 0.154906828;
means[8] = 0.118572961;
//float canvasWidth = $('#mycanvas').parent().width();
//float canvasHeight = $('#mycanvas').parent().height();
//float canvasWidth = 550;
boolean displayMedian;
//boolean displayAllTracts;
boolean displaySelectedLine;
float sliderXPos;
boolean togglingNumTracts;
var canvasWidth = 0.9*$('#parallelcoordinates').width();
canvasHeight = 0.8*canvasWidth;
boolean changedSize;
float currentSliderProportion;

void setup() {
  frameRate(5);
  size(canvasWidth,canvasHeight);
  //size(1000,1000);
  data = loadStrings(fileName);
  colNames = split(data[0], ",");
  dataLen = data.length - 1;
  mins = new float[colNames.length - 1];
  for(int i = 0; i < colNames.length - 1; i++) {
    mins[i] =  100000000.0;
  }
  maxes = new float[colNames.length - 1];
  togglesHaveChanged = false;
  frameHeight = 0.6 * canvasHeight;
  frameWidth = 0.8 * canvasWidth;
  marginX = (canvasWidth - frameWidth) / 2.0;
  topMargin = (canvasHeight - frameHeight) / 3.0;
   //(canvasHeight - frameHeight) / 3.0;
  orientations = new int[colNames.length - 1];
  colorSelectionModes = new boolean[colNames.length-1];
  dimensionSelected = new boolean[colNames.length-1];
  topKnobHeights = new float[colNames.length-1];
  bottomKnobHeights = new float[colNames.length-1];
  togglingTop = new boolean[colNames.length-1];
  togglingBottom = new boolean[colNames.length-1];
  beingDragged = new boolean[colNames.length-1];
  for(int i = 0; i < colNames.length - 1; i++) {
    maxes[i] =  -100000000.0;
    orientations[i] = 0;
    colorSelectionModes[i] = false;
    dimensionSelected[i] = true;
    togglingBottom[i] = false;
    togglingTop[i] = false;
    beingDragged[i] = false;
  }
  for(int i = 1; i < data.length; i++) {
    String[] currentRow = split(data[i], ",");
     for(int j = 1; j < colNames.length; j++) {
         mins[j-1] = min(float(currentRow[j]),mins[j-1]); 
         maxes[j-1] = max(float(currentRow[j]),maxes[j-1]); 
     }
  }

  //Precompute positions on line
  dataPositions = new float[data.length-1][colNames.length-1];
  for(int i = 1; i < data.length; i++) {
    String[] currentRow = split(data[i], ",");
    for(int j = 1; j < colNames.length; j++) {
      dataPositions[i-1][j-1] = ((float(currentRow[j])) - mins[j-1]) / (maxes[j-1] - mins[j-1]);
    }
  }
  
  f = createFont("Times New Roman", 24, true);
  rectangleSelection = false;
  displayMedian = true;
  displaySelectedLine = true;
  currentSliderProportion = 1.0;
  sliderXPos = 3.0*marginX + currentSliderProportion*(0.1*width);
  togglingNumTracts = false;
  changedSize = false;

}

//Cross product test to see if point within sides of triangle
float inTriangleHelper(float point1x, float point1y, float point2x, float point2y, float point3x, float point3y) {
    return ((point2y - point3y) * (point1x - point3x)) - ((point1y - point3y) * (point2x - point3x));
}

//Used for dimension scale sliders and reorder button
boolean inTriangle(float v1x, float v1y, float v2x, float v2y, float v3x, float v3y, float px, float py) {
  float vec1 = inTriangleHelper(px, py, v1x, v1y, v2x, v2y);
  float vec2 = inTriangleHelper(px, py, v2x, v2y, v3x, v3y);
  float vec3 = inTriangleHelper(px, py, v3x, v3y, v1x, v1y);
  
  boolean sign1 = vec1 < 0.0;
  boolean sign2 = vec2 < 0.0;
  boolean sign3 = vec3 < 0.0;
  return (sign1 == sign2) && (sign2 == sign3);
}

//Test if rectangle or mouse over line
boolean closeToLine(float x0, float y0, float x1, float y1) {
  float dx = x1 - x0;
  float dy = y1 - y0;
  float xComponent = ((mouseX - x0) * dx);
  float yComponent = ((mouseY - y0) * dy);
  float t = (yComponent + xComponent) / (dy*dy + dx*dx);
  float xIntersection = x0 + t * dx;
  float yIntersection = y0 + t * dy;
  
  if(t < 0) {
    xIntersection = x0;
    yIntersection = y0;
  }
  if(t > 1) {
    xIntersection =  x1;
    yIntersection = y1;
  }
  float ptLineDistanceX = xIntersection - mouseX;
  float ptLineDistanceY = yIntersection - mouseY;
  
  if(sqrt(ptLineDistanceX*ptLineDistanceX + ptLineDistanceY * ptLineDistanceY) < 1.0) {

    return true; 
  }
  else {
    return false; 
  }
}

//Used for dragging toggles and switching dimensions
void mousePressed() {
 if(mouseY > topMargin) {
  rectangleSelection = true;
 }
 rectangleAnchorX = mouseX;
 rectangleAnchorY = mouseY;
 
 for(int i = 1; i < colNames.length; i++) {
   float topKnobPosition = topMargin + (frameHeight * topKnobHeights[i-1]);
   if(inTriangle(marginX + (i-1) * lineWidthIncrement, topKnobPosition, (marginX + (i-1) * lineWidthIncrement) - 10.1, topKnobPosition - 7.6, (marginX + (i-1) * lineWidthIncrement) + 10.1, topKnobPosition - 7.6,mouseX, mouseY)) {
     togglesHaveChanged = true;
     togglingTop[i-1] = true;
   }
   float bottomKnobPosition = topMargin + (frameHeight * bottomKnobHeights[i-1]);
   if(inTriangle(marginX + (i-1) * lineWidthIncrement, bottomKnobPosition, (marginX + (i-1) * lineWidthIncrement) - 10.1, bottomKnobPosition + 7.6, (marginX + (i-1) * lineWidthIncrement) + 10.1, bottomKnobPosition + 7.6, mouseX, mouseY)) {
     togglesHaveChanged = true;
     togglingBottom[i-1] = true;
   }
   
   if(inTriangle((marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement) - (0.05*width), (2.55*topMargin) + frameHeight + (0.02 * height), (marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight + (0.04 * height), mouseX, mouseY) || 
         inTriangle((marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight + (0.04 * height), (marginX + (i-1) * lineWidthIncrement) + (0.05*width), (2.55*topMargin) + frameHeight + (0.02 * height), mouseX, mouseY)
      ) {
      beingDragged[i-1] = true;  
   }

   
 }
 if(Math.sqrt(((mouseX - sliderXPos) * (mouseX - sliderXPos)) + ((mouseY - (0.3*topMargin)) * (mouseY - (0.3*topMargin)) ) ) < 12) {
  togglingNumTracts = true;
 }
}

//Used when clicking buttons
void mouseClicked() {
  for(int i = 1; i < colNames.length; i++) {
    //Flip orientation if intersect toggle
    if(mouseX > marginX + (i-1) * lineWidthIncrement-(0.015*width) && mouseX < marginX + (i-1) * lineWidthIncrement+(0.015*width) && mouseY > 1.74*topMargin + frameHeight && mouseY < 1.9*topMargin + frameHeight) {
      if(orientations[i-1] == 0) {
        orientations[i-1] = 1;
      }
      else {
        if(orientations[i-1] == 1) {
           orientations[i-1] = 0;
        }
      }
    }
    
    //Toggle on/off gradient modes for axes
    if(mouseX > (marginX + (i-1) * lineWidthIncrement)-(0.03*width) && mouseX < (marginX + (i-1) * lineWidthIncrement)-(0.03*width) + (0.04*width) && mouseY > 2.15*topMargin + frameHeight && mouseY < 2.15*topMargin + frameHeight + 0.04*height) {
      if(!colorSelectionModes[i-1]) {
        for(int j = 1; j < colNames.length; j++) {
          colorSelectionModes[j-1] = false;
        }
        colorSelectionModes[i-1] = true;
      }
      else {
        for(int j = 1; j < colNames.length; j++) {
          colorSelectionModes[j-1] = false;
        }
        colorSelectionModes[i-1] = false; 
      }
    }
     if(mouseX > marginX + (i-1) * lineWidthIncrement - 2.0 && mouseX < marginX + (i-1) * lineWidthIncrement + 2.0 && mouseY > topMargin && mouseY < topMargin + frameHeight) {
       dimensionSelected[i-1] = !dimensionSelected[i-1];
     }
   }
   if(mouseX > marginX && mouseX < marginX + 0.08*width && mouseY > 0.2 * topMargin && mouseY < (0.2*topMargin)+0.04*height) {
      displayMedian = !displayMedian;
   }
   //if(mouseX > 2.0*marginX && mouseX < 2.0*marginX + 0.08*width && mouseY > 0.2 * topMargin && mouseY < (0.2*topMargin)+0.04*height) {
     // displayAllTracts = !displayAllTracts;
   //}
   if(selectedTractIndex != -1) {
     if(mouseX > 7.0*marginX && mouseX < 7.0*marginX + 0.08*width && mouseY > 0.2 * topMargin && mouseY < (0.2*topMargin)+0.04*height) {
        displaySelectedLine = !displaySelectedLine;
     }
    }
}

//Swap two dimensions: used during reordering
void swapColumns(int col1, int col2) {
  //colNames[i]
  String tempColumnName = colNames[col1+1];
  colNames[col1+1] = colNames[col2+1];
  colNames[col2+1] = tempColumnName;
  
  float tempMin = mins[col1];
  mins[col1] = mins[col2];
  mins[col2] = tempMin;
  
  float tempMax = maxes[col1];
  maxes[col1] = maxes[col2];
  maxes[col2] = tempMax;
  
  for(int i = 1; i < data.length; i++) {
      
      float dataTemp = dataPositions[i-1][col1];
      dataPositions[i-1][col1] = dataPositions[i-1][col2];
      dataPositions[i-1][col2] = dataTemp; 
  }
  
  int tempOrientation = orientations[col1];
  orientations[col1] = orientations[col2];
  orientations[col2] = tempOrientation;
  
  float tempTopKnob = topKnobHeights[col1];
  topKnobHeights[col1] = topKnobHeights[col2];
  topKnobHeights[col2] = tempTopKnob;
  
  float tempBottomKnob = bottomKnobHeights[col1];
  bottomKnobHeights[col1] = bottomKnobHeights[col2];
  bottomKnobHeights[col2] = tempBottomKnob;
  
  boolean colorSelectionMode =  colorSelectionModes[col1];
  colorSelectionModes[col1] = colorSelectionModes[col2];
  colorSelectionModes[col2] = colorSelectionMode;
  
  boolean tempSelected = dimensionSelected[col1];
  dimensionSelected[col1] = dimensionSelected[col2];
  dimensionSelected[col2] = tempSelected;
  
  
  
}

//Stop selecting with rectangle
void mouseReleased() {
 rectangleSelection = false;

 for(int j = 1; j < colNames.length; j++) {
   togglingTop[j-1] = false;
   togglingBottom[j-1] = false;
   if(beingDragged[j-1]) {
      float prevXPosition = (marginX + (j-1) * lineWidthIncrement);
      if(mouseX > prevXPosition) {
         int shiftedColumns = 0;
         for(int k = j; k < colNames.length; k++) {
           if(marginX + (k * lineWidthIncrement) < mouseX) {
              shiftedColumns += 1; 
           }
         }
         for(int i = 0; i < shiftedColumns; i++) {
           swapColumns(j - 1 + i, j + i); 
         }
      }
      else {
        int shiftedColumns = 0;
        for(int k = j - 2; k >= 0; k -= 1) {
           if(marginX + (k * lineWidthIncrement) > mouseX) {
             shiftedColumns += 1;
           }
        }
        for(int i = 0; i < shiftedColumns; i++) {
          swapColumns(j - 1 - i, j - 2 -i); 
        }
      }
   }
   beingDragged[j-1] = false;
 }
 togglingNumTracts = false;
}

//Used to test intersection with rectangle boundaries
boolean lineLineIntersection(float x0, float y0, float x1, float y1, float x01, float y01, float x11, float y11) {
  double a1 = y1 - y0;
  double b1 = x0 - x1;
  double c1 = (a1 * x0) + (b1 * y0);
  double a2 = y11 - y01;
  double b2 = x01 - x11;
  double c2 = (a2 * x01) + (b2 * y01);
  double det = (a1 * b2) - (a2 * b1);
  if(det == 0.0) {
    return false;
  }
  double xInt = ((b2 * c1) - (b1 * c2)) / det;
  double yInt = ((a1 * c2) - (a2 * c1)) / det;
  
  if((min(x0,x1) <= xInt && xInt <= max(x0,x1) && (min(y0,y1) <= yInt && yInt <= max(y0,y1)))) {
    if((min(x01,x11) <= xInt && xInt <= max(x01,x11)) || (min(y01,y11) <= yInt && yInt <= max(y01,y11))) {
    //ellipse(x01,y01,5.0,5.0);
    //ellipse(x11,y11,5.0,5.0);
    return true;  
    }
  }
  return false;
}

//Test if within or intersects rectangle
boolean selectedByRectangle(float x0, float y0, float x1, float y1) {
  float rectMinX = min(mouseX, rectangleAnchorX);
  float rectMinY = min(mouseY, rectangleAnchorY);
  float rectMaxX = max(mouseX, rectangleAnchorX);
  float rectMaxY = max(mouseY, rectangleAnchorY);
  if(x0 > rectMinX && x0 < rectMaxX && y0 > rectMinY && y0 < rectMaxY) {
    return true; 
  }
  if(x1 > rectMinX && x1 < rectMaxX && y1 > rectMinY && y1 < rectMaxY) {
    return true; 
  }
  if(lineLineIntersection(rectMinX, rectMinY, rectMaxX, rectMinY, x0, y0, x1, y1)) {
    return true; 
  }
  if(lineLineIntersection(rectMinX, rectMinY, rectMinX, rectMaxY, x0, y0, x1, y1)) {
    return true; 
  }
  if(lineLineIntersection(rectMinX, rectMaxY, rectMaxX, rectMaxY, x0, y0, x1, y1)) {
    return true; 
  }
  if(lineLineIntersection(rectMaxX, rectMinY, rectMaxX, rectMaxY, x0, y0, x1, y1)) {
    return true; 
  }
  return false;
  
}

void drawTractPercentSlider() {
  fill(color(255.0,255.0,0.0));
  if(togglingNumTracts) {
    sliderXPos = min(max(mouseX,3.0*marginX), (3.0*marginX) + 0.1*width);
    currentSliderProportion = (sliderXPos - (3.0*marginX)) / (0.1*width);
  }
  ellipse(sliderXPos,0.3*topMargin,12.0,12.0);
}


void drawColumnAtMouse(int index) {
      text(colNames[index+1], (mouseX - 0.5*textWidth(colNames[index+1])), 1.5*topMargin + frameHeight);
      float currentMax = maxes[index];
      float currentMin = mins[index];
      
      String currentMaxStr = currentMax.toString();
      if(orientations[index] == 0) {
        text(currentMaxStr, (mouseX - 0.5*textWidth(currentMaxStr)), (0.8*topMargin));
      }
      if(colorSelectionModes[index]) {
         for(float j = topMargin; j < topMargin + frameHeight; j += 1.0) {
           float currentProportion = (j - topMargin) / frameHeight;
           color currentColor = lerpColor(gradientColor1, gradientColor2, currentProportion);
           if(orientations[index] == 1) {
             currentColor = lerpColor(gradientColor1, gradientColor2, 1.0-currentProportion);
           }
           stroke(currentColor);
           
           line(mouseX - 2.0, j, mouseX + 2.0, j);
         }
         strokeWeight(4.0);
         stroke(0.0);
      }
      else {
        fill(0.0);
        line(mouseX, topMargin, mouseX, topMargin + frameHeight);
        strokeWeight(4.0);
      }
      fill(0.0);
      
      String currentMinStr = currentMin.toString();
      if(orientations[index] == 0) {
        text(currentMinStr, (mouseX - 0.5*textWidth(currentMinStr)), (1.25*topMargin) + frameHeight);
      }
      if(orientations[index] == 1) {
        text(currentMinStr, (mouseX - 0.5*textWidth(currentMaxStr)) + (index) * lineWidthIncrement, (0.8*topMargin));
        text(currentMaxStr, (mouseX - 0.5*textWidth(currentMinStr)) + (index) * lineWidthIncrement, (1.25*topMargin) + frameHeight);
      }
      
      //Dimension range triangle toggles
      strokeWeight(2.0);
      fill(color(255.0,0.0,0.0));
      if(!togglesHaveChanged) {
        topKnobHeights[index] = 0.0;
        bottomKnobHeights[index] = 1.0;
      }
      topKnobHeights[index] = max(0.0, topKnobHeights[index]);
      if(togglingTop[index]) {
         topKnobHeights[index] = max(0.0,min(bottomKnobHeights[index], (mouseY - topMargin) / frameHeight));
      }
      bottomKnobHeights[index] = min(1.0, bottomKnobHeights[index]);
      if(togglingBottom[index]) {
        bottomKnobHeights[index] = min(1.0, max(0.0, (mouseY - topMargin) / frameHeight));  
      }
      
      triangle(mouseX, topMargin + (frameHeight * topKnobHeights[index]), mouseX - 10.0, (topMargin + (frameHeight * topKnobHeights[index])) - 7.5, mouseX + 10.0, (topMargin + (frameHeight * topKnobHeights[index])) - 7.5);
      fill(color(0.0,255.0,0.0));
      triangle(mouseX, topMargin + (frameHeight * bottomKnobHeights[index]), mouseX - 10.0, topMargin + (bottomKnobHeights[index] * frameHeight) + 7.5, mouseX + 10.0, topMargin+(bottomKnobHeights[index]*frameHeight) + 7.5);
      
      //Hovering over swap buttons
      if(orientations[index] == 1) {
        fill(color(255.0,255.0,255.0));
      }
      else {
        fill(color(0.0,255.0,0.0));
        if(mouseX > (marginX + (index) * lineWidthIncrement)-(0.02*width) && mouseX < ((marginX + (index) * lineWidthIncrement)-(0.02*width)) + (0.04*width) && mouseY > 1.75*topMargin + frameHeight && mouseY < (1.75*topMargin + frameHeight) + 0.04*height) {
          fill(color(0.0,255.0,250.0));
        }
      }
      //swap buttons
      rect(mouseX-(0.02*width), 1.75*topMargin + frameHeight, 0.04*width, 0.04*height);    
      fill(0.0);
      text("swap",mouseX-(0.015*width), 1.92*topMargin + frameHeight);
      
      //Gradient buttons
      fill(color(200.0,40.0,200.0));
      rect(mouseX-(0.03*width), 2.15*topMargin + frameHeight, 0.06*width, 0.04*height);
      fill(0.0);
      text("gradient",mouseX-(0.025*width), 2.32*topMargin + frameHeight);

      fill(color(255,215,0));
      
      //quad((marginX + (i-1) * lineWidthIncrement), (2.5*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement), (2.5*topMargin) + frameHeight + (0.04 * height), (marginX + (i-1) * lineWidthIncrement) - (0.07*width), (2.5*topMargin) + frameHeight + (0.02 * height), (marginX + (i-1) * lineWidthIncrement) + (0.07*width), (2.5*topMargin) + frameHeight + (0.02 * height));
      quad(mouseX, (2.55*topMargin) + frameHeight, mouseX - (0.06*width), (2.55*topMargin) + frameHeight + (0.02 * height), mouseX, (2.55*topMargin) + frameHeight + (0.04 * height), mouseX + (0.06*width), (2.55*topMargin) + frameHeight + (0.02 * height));
      fill(0.0);
      
      text("reordering", mouseX - (textWidth("reordering")/2.0), (2.55*topMargin) + frameHeight + (0.021 * height)); 
  
}




void draw() {
   ArrayList selectedPositions = new ArrayList();
   if(0.9*$('#parallelcoordinates').width() != canvasWidth) {
    canvasWidth = 0.9*$('#parallelcoordinates').width();
    canvasHeight = 0.8*canvasWidth;
    changedSize = true;
   }
   frameHeight = 0.6 * canvasHeight;
   frameWidth = 0.8 * canvasWidth;
   marginX = (canvasWidth - frameWidth) / 2.0;
   if(changedSize) {
    changedSize = false;
    sliderXPos = 3.0 * marginX + (currentSliderProportion * (0.1* width));
   }
   topMargin = (canvasHeight - frameHeight) / 3.0;
   size(canvasWidth,canvasHeight);
   background(255);
   fill(0);
   //Calculate position of axes and labels given current window proportions, then draw them
   frameWidth = 0.8 * canvasWidth;
   frameHeight = 0.6 * canvasHeight;
   marginX = (canvasWidth - frameWidth) / 2.0;
   topMargin = (canvasHeight - frameHeight) / 3.0;
   lineWidthIncrement = frameWidth / (colNames.length-2);
   float fontPercent = ((canvasWidth / 1000) + (canvasHeight / 1000)) / 2.0;
   float textSize = fontPercent * 13.0;
   if (textSize >= 1.0) {
     fontSize = (int)textSize;
   }
   text("Characteristics of census tracts", (canvasWidth / 2.0) - (0.5 * textWidth("Characteristics of census tracts")), 0.25*topMargin);
   text("Click dimension to display scale", 0.6*marginX + 0.95*frameWidth, 0.6 * topMargin);
   
 
 
 //Draw data lines
 strokeWeight(1);
 stroke(128);
 //Color lines according to selected dimension
 int colorGradientIndex = -1;
 int draggedIndex = -1;
 for(int i = 1; i < colNames.length; i++) {
   if(colorSelectionModes[i-1]) {
     colorGradientIndex = i - 1;
   }
   if(beingDragged[i-1]) {
     draggedIndex = i - 1;
   }
 }
 if(sliderXPos > 3.0*marginX) {
  int count = 0;
  
  float[][] newVisibleTracts = new float[visibleTracts.length][colNames.length-1];
  for(int i = 0; i < visibleTracts.length; i++) {
    count += 1;
    newVisibleTracts[i] = dataPositions[visibleTracts[i]+1];
  }

 //if(displayAllTracts) {
   float dataProportion = max(0,min(1.0,(sliderXPos - 3.0*marginX) / (0.1*width)));
   //int dataToShow = min(20,(int)(dataProportion*visibleTracts.length));
   //for(int k = 0; k < dataToShow; k++) {
    //int i = visibleTracts[k] + 1;
    //for(int i = 1; i < dataProportion*data.length; i++) {
    int numToShow = count * dataProportion;
    for(int i = 0; i < numToShow; i++) {

     //float[] currentRow = dataPositions[i-1];
     float[] currentRow = newVisibleTracts[i];
     if(currentRow == null) {
      continue;
     }
     //If dimension selected, color data lines according to that dimension
     if(colorGradientIndex != -1) {
       color currentColor = lerpColor(gradientColor1, gradientColor2,1.0-currentRow[colorGradientIndex]);
       stroke(currentColor);
     }
     boolean inRange = true;
     for(int j = 0; j < currentRow.length-1; j++) {
        if(j == draggedIndex || j + 1 == draggedIndex) {
          continue; 
        }
        float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
        
        if(orientations[j] == 1) {
          pos1Y = topMargin + (currentRow[j] * frameHeight);
        }
        if(pos1Y < topMargin + (topKnobHeights[j] * frameHeight) || pos1Y > topMargin + (bottomKnobHeights[j] * frameHeight)) {
          inRange = false;
          break;
        }
        
        float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
        if(orientations[j+1] == 1) {
          pos2Y = topMargin + (currentRow[j+1] * frameHeight);
        }
        if(pos2Y < topMargin + (topKnobHeights[j+1] * frameHeight) || pos2Y > topMargin + (bottomKnobHeights[j+1] * frameHeight)) {
          inRange = false;
          break;
        }
     }
     if(!inRange) {
       continue; 
     }
     for(int j = 0; j < currentRow.length-1; j++) {
       //Dont draw in original place if dimension being reordered.
       if(j == draggedIndex || j + 1 == draggedIndex) {
          continue; 
        }
        float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
        float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
        if(orientations[j] == 1) {
          pos1Y = topMargin + (currentRow[j] * frameHeight);
        }
        if(orientations[j+1] == 1) {
          pos2Y = topMargin + (currentRow[j+1] * frameHeight);
        }
        //If mouse hovers over one segment of data point, then highlight all lines of data point
        if(!rectangleSelection && closeToLine(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y)) {
          //stroke(color(0.0,0.0,255.0));
          for(int k = 0; k < currentRow.length-1; k++) {
               pos1Y = topMargin + ((1.0 - currentRow[k]) * frameHeight);
               pos2Y = topMargin + ((1.0 - currentRow[k+1]) * frameHeight);
               if(orientations[k] == 1) {
                  pos1Y = topMargin + (currentRow[k] * frameHeight);
               }
               if(orientations[k+1] == 1) {
                  pos2Y = topMargin + (currentRow[k+1] * frameHeight);
               }
               //float[4] selectedPos = {marginX + k * lineWidthIncrement, pos1Y, marginX + (k+1) * lineWidthIncrement, pos2Y};
               selectedPositions.add(i);
           }
           break;
        }
        if(rectangleSelection) {
          //If rectangle contains or intersects one segment of data point, then highlight all lines of data point
          if(selectedByRectangle(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y)) {
            //stroke(color(0.0,0.0,255.0));
            for(int k = 0; k < currentRow.length-1; k++) {
               if(k == draggedIndex || k + 1 == draggedIndex) {
                continue; 
               }
               pos1Y = topMargin + ((1.0 - currentRow[k]) * frameHeight);
               pos2Y = topMargin + ((1.0 - currentRow[k+1]) * frameHeight);
               if(orientations[k] == 1) {
                  pos1Y = topMargin + (currentRow[k] * frameHeight);
               }
               if(orientations[k+1] == 1) {
                  pos2Y = topMargin + (currentRow[k+1] * frameHeight);
               }
               //float[4] selectedPos = {marginX + k * lineWidthIncrement, pos1Y, marginX + (k+1) * lineWidthIncrement, pos2Y};
               selectedPositions.add(i);
            }
            break;
          }
        }
        
        line(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y);
     }
  }

  for(int i = 0; i < selectedPositions.size(); i++) {
    stroke(color(0.0,0.0,255.0));
     float[] currentRow = newVisibleTracts[((int)selectedPositions.get(i))];
     //float[] currentRow = dataPositions[((int)selectedPositions.get(i))-1];
     
     //If dimension selected, color data lines according to that dimension
     if(colorGradientIndex != -1) {
       color currentColor = lerpColor(gradientColor1, gradientColor2,1.0-currentRow[colorGradientIndex]);
       stroke(currentColor);
     }
     boolean inRange = true;
     for(int j = 0; j < currentRow.length-1; j++) {
        if(j == draggedIndex || j + 1 == draggedIndex) {
          continue; 
        }
        float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
        
        if(orientations[j] == 1) {
          pos1Y = topMargin + (currentRow[j] * frameHeight);
        }
        if(pos1Y < topMargin + (topKnobHeights[j] * frameHeight) || pos1Y > topMargin + (bottomKnobHeights[j] * frameHeight)) {
          inRange = false;
          break;
        }
        
        float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
        if(orientations[j+1] == 1) {
          pos2Y = topMargin + (currentRow[j+1] * frameHeight);
        }
        if(pos2Y < topMargin + (topKnobHeights[j+1] * frameHeight) || pos2Y > topMargin + (bottomKnobHeights[j+1] * frameHeight)) {
          inRange = false;
          break;
        }
     }
     if(!inRange) {
       continue; 
     }
      for(int j = 0; j < currentRow.length-1; j++) {
       //Dont draw in original place if dimension being reordered.
       if(j == draggedIndex || j + 1 == draggedIndex) {
          continue; 
        }
        float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
        float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
        if(orientations[j] == 1) {
          pos1Y = topMargin + (currentRow[j] * frameHeight);
        }
        if(orientations[j+1] == 1) {
          pos2Y = topMargin + (currentRow[j+1] * frameHeight);
        }
        line(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y);
    }
  }
  stroke(128);
}

if(selectedTractIndex != -1 && displaySelectedLine) {
  stroke(color(0.0,255.0,0.0));
  strokeWeight(3.0);
  float[] currentRow = dataPositions[selectedTractIndex];
   
   for(int j = 0; j < currentRow.length-1; j++) {
      if(j == draggedIndex || j + 1 == draggedIndex) {
        continue; 
      }
      float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
      
      if(orientations[j] == 1) {
        pos1Y = topMargin + (currentRow[j] * frameHeight);
      }
      if(pos1Y < topMargin + (topKnobHeights[j] * frameHeight) || pos1Y > topMargin + (bottomKnobHeights[j] * frameHeight)) {
        inRange = false;
        break;
      }
      
      float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
      if(orientations[j+1] == 1) {
        pos2Y = topMargin + (currentRow[j+1] * frameHeight);
      }
      if(pos2Y < topMargin + (topKnobHeights[j+1] * frameHeight) || pos2Y > topMargin + (bottomKnobHeights[j+1] * frameHeight)) {
        break;
      }
   }

   for(int j = 0; j < currentRow.length-1; j++) {
     //Dont draw in original place if dimension being reordered.
     if(j == draggedIndex || j + 1 == draggedIndex) {
        continue; 
      }
      float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
      float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
      if(orientations[j] == 1) {

        pos1Y = topMargin + (currentRow[j] * frameHeight);
      }
      if(orientations[j+1] == 1) {
        pos2Y = topMargin + (currentRow[j+1] * frameHeight);
      }

      
     line(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y);
   }

}
if(displayMedian) { 
  stroke(color(255.0,0.0,0.0));
  strokeWeight(3.0);
  float[] currentRow = means;
   
   for(int j = 0; j < currentRow.length-1; j++) {
      if(j == draggedIndex || j + 1 == draggedIndex) {
        continue; 
      }
      float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
      
      if(orientations[j] == 1) {
        pos1Y = topMargin + (currentRow[j] * frameHeight);
      }
      if(pos1Y < topMargin + (topKnobHeights[j] * frameHeight) || pos1Y > topMargin + (bottomKnobHeights[j] * frameHeight)) {
        inRange = false;
        break;
      }
      
      float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
      if(orientations[j+1] == 1) {
        pos2Y = topMargin + (currentRow[j+1] * frameHeight);
      }
      if(pos2Y < topMargin + (topKnobHeights[j+1] * frameHeight) || pos2Y > topMargin + (bottomKnobHeights[j+1] * frameHeight)) {
        break;
      }
   }

   for(int j = 0; j < currentRow.length-1; j++) {
     //Dont draw in original place if dimension being reordered.
     if(j == draggedIndex || j + 1 == draggedIndex) {
        continue; 
      }
      float pos1Y = topMargin + ((1.0 - currentRow[j]) * frameHeight);
      float pos2Y = topMargin + ((1.0 - currentRow[j+1]) * frameHeight);
      if(orientations[j] == 1) {
        pos1Y = topMargin + (currentRow[j] * frameHeight);
      }
      if(orientations[j+1] == 1) {
        pos2Y = topMargin + (currentRow[j+1] * frameHeight);
      }
      //If mouse hovers over one segment of data point, then highlight all lines of data point
      
      
      line(marginX + j * lineWidthIncrement, pos1Y, marginX + (j+1) * lineWidthIncrement, pos2Y);
   }

}
 
 if(rectangleSelection) {
   fill(color(0,0,255),0.5);
   rect(min(mouseX, rectangleAnchorX),min(mouseY, rectangleAnchorY), abs(mouseX - rectangleAnchorX), abs(mouseY - rectangleAnchorY));
 }
 
   

   for(int i = 1; i < colNames.length; i++) {
      textSize = fontPercent * 20.0;
       if (textSize >= 1.0) {
         fontSize = (int)textSize;
       }
       textFont(f, fontSize);
      if(i - 1 == draggedIndex) {
              continue; 
      }

      float textSize = fontPercent * 16.0;
       if (textSize >= 1.0) {
         fontSize = (int)textSize;
       }
      
      text(colNames[i], (marginX - 0.25*textWidth(colNames[i])) + (i-1) * lineWidthIncrement, 1.3*topMargin + frameHeight, 0.09*width, 0.06*height);
      
      textSize = fontPercent * 20.0;
       if (textSize >= 1.0) {
         fontSize = (int)textSize;
       }
      textFont(f, fontSize);
     strokeWeight(4);
     fill(0.0);
     stroke(0);
      float currentMax = maxes[i-1];
      float currentMin = mins[i-1];
      //If dimension clicked on, display scale
      if(dimensionSelected[i-1]) {
        for(float j = 1.0; j <= 4.0; j += 1.0) {
           float currentYPos = topMargin + ((j / 5.0) * frameHeight);
           float axisValue = ((5.0 - j) / 5.0) *(currentMax - currentMin);
           if(orientations[i-1] == 1) {
             axisValue = (j / 5.0) * (currentMax - currentMin);
           }
           if(axisValue <= 1) {
            axisValue *= 10000.0;
            int roundedAxisValue = Math.round(axisValue);
            axisValue = roundedAxisValue / 100;
          }
           text(axisValue.toString(), marginX + (i-1) * lineWidthIncrement - textWidth(axisValue.toString()) - 6.0,currentYPos);
        }
      }

      String currentMaxStr = currentMax.toString();
      if(currentMax <= 1) {
        currentMax *= 10000.0;
        int roundedMax = Math.round(currentMax);
        currentMax = roundedMax / 100;
        currentMaxStr = currentMax.toString();
      }
      
      if(orientations[i-1] == 0) {
        text(currentMaxStr, (marginX - 0.5*textWidth(currentMaxStr)) + (i-1) * lineWidthIncrement, (0.8*topMargin));
      }
      if(colorSelectionModes[i-1]) {
         if(mouseX > marginX + (i-1) * lineWidthIncrement - 2.0 && mouseX < marginX + (i-1) * lineWidthIncrement + 2.0 && mouseY > topMargin && mouseY < topMargin + frameHeight) {
           strokeWeight(8); 
         }
         for(float j = topMargin; j < topMargin + frameHeight; j += 1.0) {
           float currentProportion = (j - topMargin) / frameHeight;
           color currentColor = lerpColor(gradientColor1, gradientColor2, currentProportion);
           if(orientations[i-1] == 1) {
             currentColor = lerpColor(gradientColor1, gradientColor2, 1.0-currentProportion);
           }
           stroke(currentColor);
           
           line(marginX + (i-1) * lineWidthIncrement - 2.0, j, marginX + (i-1) * lineWidthIncrement + 2.0, j);
         }
         strokeWeight(4.0);
         stroke(0.0);
      }
      else {
        fill(0.0);
        if(mouseX > marginX + (i-1) * lineWidthIncrement - 2.0 && mouseX < marginX + (i-1) * lineWidthIncrement + 2.0 && mouseY > topMargin && mouseY < topMargin + frameHeight) {
           strokeWeight(8); 
         }
        line(marginX + (i-1) * lineWidthIncrement, topMargin, marginX + (i-1) * lineWidthIncrement, topMargin + frameHeight);
        strokeWeight(4.0);
      }
      fill(0.0);
      
      String currentMinStr = currentMin.toString();
      if(currentMin <= 1) {
        currentMin *= 10000.0;
        int roundedMin = Math.round(currentMin);
        currentMin = roundedMin / 100;
        currentMinStr = currentMin.toString();
      }
      if(orientations[i-1] == 0) {
        text(currentMinStr, (marginX - 0.5*textWidth(currentMinStr)) + (i-1) * lineWidthIncrement, (1.25*topMargin) + frameHeight);
      }
      if(orientations[i-1] == 1) {
        text(currentMinStr, (marginX - 0.5*textWidth(currentMaxStr)) + (i-1) * lineWidthIncrement, (0.8*topMargin));
        text(currentMaxStr, (marginX - 0.5*textWidth(currentMinStr)) + (i-1) * lineWidthIncrement, (1.25*topMargin) + frameHeight);
      }
      
      //Dimension range triangle toggles
      strokeWeight(2.0);
      if(sliderXPos > 3.0 * marginX) {
        
        fill(color(255.0,0.0,0.0));
        if(!togglesHaveChanged) {
          topKnobHeights[i-1] = 0.0;
          bottomKnobHeights[i-1] = 1.0;
        }
        topKnobHeights[i-1] = max(0.0, topKnobHeights[i-1]);
        if(togglingTop[i-1]) {
           topKnobHeights[i-1] = max(0.0,min(bottomKnobHeights[i-1], (mouseY - topMargin) / frameHeight));
        }
        bottomKnobHeights[i-1] = min(1.0, bottomKnobHeights[i-1]);
        if(togglingBottom[i-1]) {
          bottomKnobHeights[i-1] = min(1.0, max(0.0, (mouseY - topMargin) / frameHeight));  
        }
        
        triangle(marginX + (i-1) * lineWidthIncrement, topMargin + (frameHeight * topKnobHeights[i-1]), (marginX + (i-1) * lineWidthIncrement) - 10.0, (topMargin + (frameHeight * topKnobHeights[i-1])) - 7.5, (marginX + (i-1) * lineWidthIncrement) + 10.0, (topMargin + (frameHeight * topKnobHeights[i-1])) - 7.5);
        fill(color(0.0,255.0,0.0));
        triangle(marginX + (i-1) * lineWidthIncrement, topMargin + (frameHeight * bottomKnobHeights[i-1]), (marginX + (i-1) * lineWidthIncrement) - 10.0, topMargin + (bottomKnobHeights[i-1] * frameHeight) + 7.5, (marginX + (i-1) * lineWidthIncrement) + 10.0, topMargin+(bottomKnobHeights[i-1]*frameHeight) + 7.5);
        
      }
      //Hovering over swap buttons
      if(orientations[i - 1] == 1) {
        fill(color(0.0,255.0,250.0));
        if(mouseX > (marginX + (i-1) * lineWidthIncrement)-(0.02*width) && mouseX < ((marginX + (i-1) * lineWidthIncrement)-(0.02*width)) + (0.04*width) && mouseY > 1.75*topMargin + frameHeight && mouseY < (1.75*topMargin + frameHeight) + 0.04*height) {
          fill(color(0.0,255.0,0.0));
        }
      }
      else {
        fill(color(0.0,255.0,0.0));
        if(mouseX > (marginX + (i-1) * lineWidthIncrement)-(0.02*width) && mouseX < ((marginX + (i-1) * lineWidthIncrement)-(0.02*width)) + (0.04*width) && mouseY > 1.75*topMargin + frameHeight && mouseY < (1.75*topMargin + frameHeight) + 0.04*height) {
          fill(color(0.0,255.0,250.0));
        }
      }
      strokeWeight(0.0001);

      triangle(marginX + (i-1) * lineWidthIncrement-(0.015*width), 1.82*topMargin + frameHeight, marginX + (i-1) * lineWidthIncrement+(0.015*width), 1.82*topMargin + frameHeight, marginX + (i-1) * lineWidthIncrement, 1.75*topMargin + frameHeight);
      triangle(marginX + (i-1) * lineWidthIncrement-(0.015*width), 1.91*topMargin + frameHeight, marginX + (i-1) * lineWidthIncrement+(0.015*width), 1.91*topMargin + frameHeight, marginX + (i-1) * lineWidthIncrement, 1.99*topMargin + frameHeight);
      rect(marginX + (i-1) * lineWidthIncrement-(0.005*width), 1.8*topMargin + frameHeight, 0.01*width, 0.16*topMargin);
      strokeWeight(1.0);
      //swap buttons
      //rect((marginX + (i-1) * lineWidthIncrement)-(0.02*width), 1.75*topMargin + frameHeight, 0.04*width, 0.04*height);    
      //fill(0.0);
      //text("swap",(marginX + (i-1) * lineWidthIncrement)-(0.015*width), 1.92*topMargin + frameHeight);
      float textSize = fontPercent * 13.0;
       if (textSize >= 1.0) {
         fontSize = (int)textSize;
       }
       textFont(f, fontSize);
      if(sliderXPos > 3.0*marginX) {
        //Gradient buttons
        if(colorSelectionModes[i - 1]) {
          fill(color(255.0,255.0,255.0));
        }
        else {
          fill(color(200.0,40.0,200.0)); 
          if(mouseX > (marginX + (i-1) * lineWidthIncrement)-(0.03*width) && mouseX < (marginX + (i-1) * lineWidthIncrement)-(0.03*width) + (0.06*width) && mouseY > 2.15*topMargin + frameHeight && mouseY < 2.15*topMargin + frameHeight + 0.04*height) {
            fill(color(255.0,110.0,180.0)); 
          }      
         }
        rect((marginX + (i-1) * lineWidthIncrement)-(0.03*width), 2.15*topMargin + frameHeight, 0.05*width, 0.04*height);

        fill(0.0);
        text("gradient",(marginX + (i-1) * lineWidthIncrement)-(0.025*width), 2.32*topMargin + frameHeight);
      }
      fill(color(255,255,102));
      if(inTriangle((marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement) - (0.05*width), (2.55*topMargin) + frameHeight + (0.02 * height), (marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight + (0.04 * height), mouseX, mouseY) || 
         inTriangle((marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight + (0.04 * height), (marginX + (i-1) * lineWidthIncrement) + (0.05*width), (2.55*topMargin) + frameHeight + (0.02 * height), mouseX, mouseY)
      ) {
        fill(color(255,215,0));
      }
      quad((marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight, (marginX + (i-1) * lineWidthIncrement) - (0.035*width), (2.55*topMargin) + frameHeight + (0.02 * height), (marginX + (i-1) * lineWidthIncrement), (2.55*topMargin) + frameHeight + (0.04 * height), (marginX + (i-1) * lineWidthIncrement) + (0.035*width), (2.55*topMargin) + frameHeight + (0.02 * height));
      fill(0.0);
      
      text("reorder", (marginX + (i-1) * lineWidthIncrement) - (textWidth("reorder")/2.0), (2.55*topMargin) + frameHeight + (0.021 * height));
      
 }
 if(draggedIndex != -1) {
    drawColumnAtMouse(draggedIndex);
 }

 if(mouseX > marginX && mouseX < marginX + 0.08*width && mouseY > 0.2*topMargin && mouseY < 0.2*topMargin+0.04*height) {
  fill(color(200.0,200.0,200.0));
 }
 else {
   if(displayMedian) {
    fill(color(255.0,0.0,0.0));
   }
   else {
    fill(color(255.0,255.0,255.0));
   }
 }
 rect(marginX, 0.2 * topMargin, 0.08*width,0.04*height);
 fill(0.0);
 text("Show means", 1.07*marginX, 0.36 * topMargin);



 text("Percent tracts to show", 1.9*marginX, 0.33 * topMargin);

 if(selectedTractIndex != -1) {
   if(mouseX > 7.0*marginX && mouseX < 7.0*marginX + 0.08*width && mouseY > 0.2*topMargin && mouseY < 0.2*topMargin+0.04*height) {
    fill(color(200.0,200.0,200.0));
   }
   else {
     if(displaySelectedLine) {
      fill(color(0.0,255.0,0.0));
     }
     else {
      fill(color(255.0,255.0,255.0));
     }
   }
   rect(7.0*marginX, 0.2 * topMargin, 0.1*width,0.04*height);
   fill(0.0);
   text("Show selected tract", 7.03*marginX, 0.36 * topMargin);
}
fill(0.0);
rect(3.0*marginX, 0.27 * topMargin, 0.1*width, 0.005*height);
text("0%", 2.9*marginX, 0.53*topMargin);
text("100%", 3.9*marginX, 0.53*topMargin);
drawTractPercentSlider();

 
}