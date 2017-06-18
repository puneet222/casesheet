$(function() {
  // $('.header-close').click(function() {
  //   window.close();
  // });

  $("#lightgallery").lightGallery();

  var caseId = '1551798614836935_1489643243.62';   // ------------------  changed
  var doctorId= '123';                            // ------------------  changed
  var $header2 = $('.header2-content');

  console.log(location) ;
  $('.topBar').hide() ;

  // var param_string = location.search.split('?')[1];
  // var params = param_string.split('&');
  // console.log(param_string);
  // params.forEach(function(param){
  //   keyValues = param.split('=');
  //   console.log(keyValues);
  //   key = keyValues[0]
  //   value = keyValues[1]
  //   if(key === 'case_id'){
  //     caseId = value
  //   } else if(key === 'doctor_id'){
  //     doctorId = value
  //   }
  // });
  // if (!caseId) return $header2.text('Invalid URL, cannot find case id');
  // $header2.text('Loading case sheet of the patient');

  // ------------------  changed

  $.ajax({
    type: "GET",
    url: "https://kw05r0cvh1.execute-api.us-west-2.amazonaws.com/milos/online-consultation/casesheet?case_id=" + caseId + "&doctor_id=" + 123,
    // contentType: "application/json; charset=utf-8",
    dataType: "json",
    // data: JSON.stringify(emailData),
    success: caseDataHandler,
    error: function () {
      $header2.text('Failed to load data for case "' + caseId + '". Please try later.');
    }
  });

  function caseDataHandler(caseData) {
    console.log(caseData);
    var patientId = caseData.patient_id;
    var pInfo = caseData.patient_info;
    var status = caseData.status;
    var attachments = caseData.attachments;

    $header2.text(caseData.Title);
    $('.topBar').show() ;

    pInfo.forEach(function (row) {
      Object.keys(row).forEach(function (key) {
        var val = row[key];
        if (val.join) val = val.join(', ');
        $('.case-table').append
          ($('<tr>' +
                '<td class="case-table-left">' + key + ' :</td>' +
                '<td class="case-table-right">' + val + '</td>' +
             '</tr>')
        );
      });
    });
    var i = 0 ;
    Object.keys(attachments).forEach(function (key) {
      var val = attachments[key];
      // val is an array
      var valHtml = '' ;
      i++ ;
      var customId = 'lightGallery' + i ;
      var galleryHtml = '<div class="demo-gallery">' ;
      galleryHtml += '<ul style="margin:0px;padding:0px;" id="' + customId + '">' ;
      val.forEach(function(row){
        var url = '' ;
        var value = '' ;
        Object.keys(row).forEach(function (key) {
          var temp = key.split('_')[1] ;
          if(temp == 'url'){
            url = row[key] ;
          }
          else{
            value = row[key] ;
          }
        });
        // got the url and value
        var infoHtml = '' ;
        galleryHtml += '<li style="margin:0px;" data-reponsive="' + url + '" data-src="' + url + '" data-sub-html="<h3>' +  value + '</h3>" >' ;
        galleryHtml += '<a><h5 style="margin:0px;font-size:0.9em;color:#1787fb;text-decoration:underline">' + value + '</h5></a>' ;
        galleryHtml += '</li>' ;
      });
      galleryHtml += '</ul>' ;
      galleryHtml += '</div>' ;
      $('.case-table').append
        ($('<tr>' +
              '<td class="case-table-left">' + key + ' :</td>' +
              '<td class="case-table-right">' + galleryHtml + '</td>' +
           '</tr>')
      );
      $("#" + customId).lightGallery() ;
    });


    // $('.table-bmi').text(pInfo.BMI);
    // $('.table-bp').text(pInfo.BP);
    // $('.table-complaint').text(pInfo['Chief complaint']);
    // $('.table-behaviour').text(pInfo.Behaviour || "");
    // $('.table-symptoms').text(pInfo["Other symptoms observed"].join(", "));
    // $('.table-diagnosis').text(pInfo["Previous diagnosis"].join(", "));
    // $('.table-medication').text(pInfo["Current medication"].join(", "));
    // $('.table-reports').html(
    //   pInfo["Reports and Tests"].reduce(function(acc, r) {
    //     return acc + '<span><a href="#">' + r + '</a> <br /></span>'
    //   }, '') + '* Click on the report to view'
    // );

    console.log("here") ;

    $('.case-details').show();
    if (status === 'waiting') {
      $('.case-buttons-ignore').unbind().click(caseIgnoreHandler.bind(null, doctorId, patientId));
      $('.case-buttons-reject').unbind().click(caseRejectHandler.bind(null, doctorId, patientId));
      $('.case-buttons-takeup').unbind().click(caseTakeUpHandler.bind(null, doctorId, patientId));
      $('.case-buttons').show();
    }
    else {
      $('.case-taken').show();
      $('.case-add-diff').show();
    }

  }

  function caseIgnoreHandler(doctorId, patientId, event) {
    console.info('case ignore');
    closeHandler('ignored');
  }

  function caseRejectHandler(doctorId, patientId, event) {
    console.info('case reject', doctorId, patientId);
    $('.case-loading-text').text('Case being rejected ...');
    $('.case-loading').show();
    $('.case-details').hide();
    $('.case-footer').hide();
    $('.header2').hide();

    $.ajax({
      type: "POST",
      url: "https://kw05r0cvh1.execute-api.us-west-2.amazonaws.com/milos/praktice/",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        doctor_id: doctorId,
        patient_id: patientId,
        sender: 'elth',
        response: 'rejected'
      }),
      success: function () {
        console.info('case rejected');
        closeHandler('rejected');
      },
      error: function (err) {
        console.warn('case rejection failed!', err);
      }
    });
  }

  function caseTakeUpHandler(doctorId, patientId, event) {
    console.info('case take up', doctorId, patientId);
    $('.case-loading-text').text('Case being accepted ...');
    $('.case-loading').show();
    $('.case-details').hide();
    $('.case-footer').hide();
    $('.header2').hide();

    var p1 = $.ajax({
      type: "POST",
      url: "https://kw05r0cvh1.execute-api.us-west-2.amazonaws.com/milos/elth/",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        doctor_id: doctorId,
        patient_id: patientId,
        payload: 'node-online-consultation-doctor-start-chat',
        sender: 'praktice',
        response: 'accepted'
      })
    });
    var p2 = $.ajax({
      type: "POST",
      url: "https://kw05r0cvh1.execute-api.us-west-2.amazonaws.com/milos/praktice/",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        doctor_id: doctorId,
        patient_id: patientId,
        sender: 'elth',
        response: 'accepted'
      })
    });

    $.when( p1, p2 )
      .done(function () {
        console.info('case take up completed!');
        closeHandler('taken');
      })
      .fail(function (err) {
        console.warn('case take up failed!', err);
      });

  }

  function closeHandler(action) {
    $('.case-footer').hide();
    $('.case-loading').hide();
    $('.case-details').show().html(
      '<div class="close-message">' +
      'The case "' + caseId + '" is ' + (action || 'handled') +
      '. You can close the page now.' +
      '</div>'
    );

    if (!MessengerExtensions || !MessengerExtensions.isInExtension()) return;
    MessengerExtensions.requestCloseBrowser(function success() {
      console.info('close success')
    }, function error(err) {
      console.info('close failed')
    });
  }

});


window.extAsyncInit = function() {
  // the Messenger Extensions JS SDK is done loading
  console.info('Messenger Extensions JS SDK loaded ...');
};
