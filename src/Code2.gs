function doGet(e) {
  var eventId = (e && e.parameter && e.parameter.event) ? e.parameter.event : '';
  var tmpl = HtmlService.createTemplateFromFile('Index');
  tmpl.initialEventId = eventId;
  return tmpl.evaluate()
    .setTitle('Dr. Sulaiman Al Habib Group Events Attendance')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function getEvents() {
  var sheet = getSheet('Events', ['ID', 'EventName', 'Lat', 'Lng', 'Radius', 'StartTime', 'GraceMinutes', 'VenueCode', 'EndTime']);
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    out.push({ id: data[i][0], name: data[i][1], startTime: data[i][5] });
  }
  return out;
}

function getEvent(id) {
  var sheet = getSheet('Events', ['ID', 'EventName', 'Lat', 'Lng', 'Radius', 'StartTime', 'GraceMinutes', 'VenueCode', 'EndTime']);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return {
        id: data[i][0],
        eventName: data[i][1],
        lat: parseFloat(data[i][2]),
        lng: parseFloat(data[i][3]),
        radius: parseFloat(data[i][4]),
        startTime: data[i][5],
        graceMinutes: parseFloat(data[i][6]),
        venueCode: data[i][7],
        endTime: data[i][8] || ''
      };
    }
  }
  return null;
}

function saveEvent(payload) {
  var sheet = getSheet('Events', ['ID', 'EventName', 'Lat', 'Lng', 'Radius', 'StartTime', 'GraceMinutes', 'VenueCode', 'EndTime']);
  var id = 'ev' + new Date().getTime() + Math.random().toString(36).slice(2, 6);
  sheet.appendRow([id, payload.eventName, payload.lat, payload.lng, payload.radius, payload.startTime, payload.graceMinutes, payload.venueCode || '', payload.endTime || '']);
  return { id: id };
}

function checkExisting(eventId, nationalId) {
  var sheet = getSheet('Checkins', ['EventID', 'NationalID', 'Name', 'Timestamp', 'Status', 'LateMinutes', 'Distance', 'Photo', 'DeviceID', 'CheckoutTime']);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId) && String(data[i][1]) === String(nationalId)) {
      return { exists: true, timestamp: data[i][3], status: data[i][4], lateMinutes: data[i][5] };
    }
  }
  return { exists: false };
}

function doCheckin(payload) {
  var existing = checkExisting(payload.eventId, payload.nationalId);
  if (existing.exists) return { ok: false, alreadyExists: true, existing: existing };
  var sheet = getSheet('Checkins', ['EventID', 'NationalID', 'Name', 'Timestamp', 'Status', 'LateMinutes', 'Distance', 'Photo', 'DeviceID', 'CheckoutTime']);
  sheet.appendRow([payload.eventId, payload.nationalId, payload.name, payload.timestamp, payload.status, payload.lateMinutes, payload.distance, payload.photo || '', payload.deviceId || '', '']);
  return { ok: true };
}

function doCheckout(eventId, nationalId, timestamp) {
  var sheet = getSheet('Checkins', ['EventID', 'NationalID', 'Name', 'Timestamp', 'Status', 'LateMinutes', 'Distance', 'Photo', 'DeviceID', 'CheckoutTime']);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId) && String(data[i][1]) === String(nationalId)) {
      if (data[i][9]) {
        return { ok: false, alreadyCheckedOut: true, checkoutTime: data[i][9] };
      }
      sheet.getRange(i + 1, 10).setValue(timestamp);
      return { ok: true };
    }
  }
  return { ok: false, notCheckedIn: true };
}

function getRecords(eventId) {
  var sheet = getSheet('Checkins', ['EventID', 'NationalID', 'Name', 'Timestamp', 'Status', 'LateMinutes', 'Distance', 'Photo', 'DeviceID', 'CheckoutTime']);
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId)) {
      out.push({
        id: data[i][1],
        name: data[i][2],
        timestamp: data[i][3],
        status: data[i][4],
        lateMinutes: data[i][5],
        distance: data[i][6],
        photo: data[i][7],
        deviceId: data[i][8],
        checkoutTime: data[i][9] || ''
      });
    }
  }
  return out;
}

function verifyPin(pin) {
  var sheet = getSheet('Settings', ['Key', 'Value']);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'organizerPin') {
      return { ok: data[i][1] === pin };
    }
  }
  sheet.appendRow(['organizerPin', pin]);
  return { ok: true, firstTime: true };
}

function shortenUrl(longUrl) {
  try {
    var resp = UrlFetchApp.fetch('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(longUrl));
    var text = resp.getContentText();
    if (text.indexOf('Error') === 0) return longUrl;
    return text;
  } catch (e) {
    return longUrl;
  }
}
