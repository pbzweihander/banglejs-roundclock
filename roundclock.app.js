{
  var minutes;
  var seconds;
  var hours;
  var hoursForDrawing;
  var date;
  var first = true;
  var locale = require('locale');

  //HR variables
  var id = 0;
  var grow = true;
  var size=10;

  //Screen dimensions
  const screen = {
    width: g.getWidth(),
    height: g.getWidth(),
    middle: g.getWidth() / 2,
    center: g.getHeight() / 2,
  };

  // Ssettings
  const settings = {
    time: {
      color: 0xD6ED17,
      font: 'Vector',
      size: 60,
      middle: screen.middle,
      center: screen.center,
    },
    date: {
      color: 0xD6ED17,
      font: 'Vector',
      size: 15,
      middle: screen.height-17, // at bottom of screen
      center: screen.center,
    },
    circle: {
      colorhour: 0xFFFFFF,
      colormin: 0xFFFFFF,
      colorsec: 0xFFFFFF,
      initialPosition: 20,
      spacing: 30,
      width: 20,
      middle: screen.middle,
      center: screen.center,
      height: screen.height
    },
    hr: {
      color: 0x333333,
      size: 10,
      x: screen.center,
      y: screen.middle
    }
  };

  const dateStr = function (date) {
    return locale.date(date, 1);
  };

  const getArcXY = function (centerX, centerY, radius, angle) {
    var s, r = [];
    s = 2 * Math.PI * angle / 360;
    r.push(centerX + Math.round(Math.cos(s) * radius));
    r.push(centerY + Math.round(Math.sin(s) * radius));

    return r;
  };

  const drawArc = function (position, sections, color, divisior) {
    g.setColor(color);
    rad = (settings.circle.height / 2) - position;
    r1 = getArcXY(settings.circle.middle, settings.circle.center, rad, sections * (360 / divisior) - 90);
    r2 = getArcXY(settings.circle.middle, settings.circle.center, rad - settings.circle.width, sections * (360 / divisior) - 90);
    g.drawLine(r1[0], r1[1], r2[0], r2[1]);
    g.setColor('#333333');
    g.drawCircle(settings.circle.middle, settings.circle.center, rad - settings.circle.width - 4);
  };

  const drawHourArc = function (sections) {
    drawArc(settings.circle.initialPosition, sections, settings.circle.colorhour, 12);
  };

  const drawMinArc = function (sections) {
    drawArc(settings.circle.initialPosition + settings.circle.spacing, sections, settings.circle.colormin, 60);
  };

  const drawSecArc = function (sections) {
    drawArc(settings.circle.initialPosition + (settings.circle.spacing * 2), sections, settings.circle.colorsec, 60);
  };

  const drawClock = function () {

    currentTime = new Date();

    //Set to initial time when started
    if (first == true) {
      minutes = currentTime.getMinutes();
      seconds = currentTime.getSeconds();
      hours = currentTime.getHours();
      if (hours >= 12) {
        hoursForDrawing = hours - 12;
      } else {
        hoursForDrawing = hours;
      }
      for (count = 0; count <= hoursForDrawing; count++) {
        drawHourArc(count);
      }
      for (count = 0; count <= minutes; count++) {
        drawMinArc(count);
      }
      for (count = 0; count <= seconds; count++) {
        drawSecArc(count);
      }
      first = false;
    }

    // Reset seconds
    if (seconds == 59) {
      g.setColor('#000000');
      // Reset minutes
      if (minutes == 59) {
        // Reset hours
        if (hoursForDrawing == 11) {
          g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2) - settings.circle.initialPosition);
        } else {
          g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2) - (settings.circle.initialPosition + settings.circle.spacing));
        }
      } else {
        g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2) - (settings.circle.initialPosition + (settings.circle.spacing * 2)));
      }
    }

    //Get date as a string
    date = dateStr(currentTime);

    // Update hours when needed
    if (hours != currentTime.getHours()) {
      hours = currentTime.getHours();
      if (hours > 13) {
        hoursForDrawing = hours - 12;
      } else {
        hoursForDrawing = hours;
      }
      drawHourArc(hoursForDrawing);
    }

    // Update minutes when needed
    if (minutes != currentTime.getMinutes()) {
      minutes = currentTime.getMinutes();
      drawMinArc(minutes);
    }

    //Update seconds when needed
    if (seconds != currentTime.getSeconds()) {
      seconds = currentTime.getSeconds();
      drawSecArc(seconds);
    }

    g.setFontAlign(0, 0, 0);
    g.setColor(settings.date.color);
    g.setFont(settings.date.font, settings.date.size);
    g.drawString(date, settings.date.center, settings.date.middle);
  };

  //setInterval for HR visualisation
  const newBeats = function (hr) {
    if (id != 0) {
      changeInterval(id, 6e3 / hr.bpm);
    } else {
      id = setInterval(drawHR, 6e3 / hr.bpm);
    }
  };

  //visualize HR with circles pulsating
  const drawHR = function () {
    if (grow && size < settings.hr.size) {
      size++;
    }

    if (!grow && size > 3) {
      size--;
    }

    if (size == settings.hr.size || size == 3) {
      grow = !grow;
    }

    if (grow) {
      color = settings.hr.color;
      g.setColor(color);
      g.fillCircle(settings.hr.x, settings.hr.y, size);
    } else {
      color = "#000000";
      g.setColor(color);
      g.drawCircle(settings.hr.x, settings.hr.y, size);
    }
  };

  // clean app screen
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  //manage when things should be enabled and not
  Bangle.on('lcdPower', function (on) {
    if (on) {
      Bangle.setHRMPower(1);
    } else {
      Bangle.setHRMPower(0);
    }
  });

  // refesh every second
  setInterval(drawClock, 1E3);

  //start HR monitor and update frequency of update
  Bangle.setHRMPower(1);
  Bangle.on('HRM', function (d) {
    newBeats(d);
  });

  // draw now
  drawClock();

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

}
