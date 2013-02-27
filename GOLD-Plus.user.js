// ==UserScript==
// @name           GOLD Plus
// @namespace      http://kevingibbons.org
// @description    Checks the damn checkbox. Inline course descriptions in search results. Makes sidebar links actual links (new-tab-able).
// @include        https://my.sa.ucsb.edu/gold/*
// ==/UserScript==

var sheeted = false; // global variables are your friend!

// On login page, click damn box. Uncomment the second line and it'll log itself in, provided you have the correct credentials saved.
if(window.location.toString().toLowerCase().split('?')[0] == 'https://my.sa.ucsb.edu/gold/login.aspx') {
  
  document.getElementById('pageContent_CredentialCheckBox').checked = true;
  //setTimeout(function(){document.getElementById('pageContent_loginButton').click()}, 100);

}
else {
  // Not on the login page? Fix the sidebar. Set up some helper stuff used on several pages.
  var nav = document.querySelector('#sidebarTable');
  if(nav) {
    nav.querySelector('#ctl03').href = 'https://my.sa.ucsb.edu/gold/StudentSchedule.aspx';
    nav.querySelector('#ctl05').href = 'https://my.sa.ucsb.edu/gold/BasicFindCourses.aspx';
    nav.querySelector('#ctl07').href = 'https://my.sa.ucsb.edu/gold/RegistrationInfo.aspx';
    nav.querySelector('#ctl09').href = 'https://my.sa.ucsb.edu/gold/Message.aspx';
    nav.querySelector('#ctl11').href = 'https://my.sa.ucsb.edu/gold/StudentGrades.aspx';
    nav.querySelector('#ctl13').href = 'https://my.sa.ucsb.edu/gold/MinimumCumulativeProgress.aspx';
    nav.querySelector('#ctl15').href = 'https://my.sa.ucsb.edu/gold/AcademicProgress.aspx';
    nav.querySelector('#ctl17').href = 'https://my.sa.ucsb.edu/gold/Address.aspx';
    nav.querySelector('#ctl19').href = 'https://my.sa.ucsb.edu/gold/PersonalData.aspx';
    nav.querySelector('#ctl21').href = 'https://my.sa.ucsb.edu/gold/TranscriptsVerifications.aspx';
    nav.querySelector('#ctl23').href = 'https://my.sa.ucsb.edu/gold/Graduation.aspx';
    nav.querySelector('#ctl25').href = 'https://my.sa.ucsb.edu/gold/Feedback.aspx';
  }
  
  // lol hardcoded names
  var blockNames = ['pageContent_DescPageView', 'pageContent_PreReqPageView', 'pageContent_RestrictionPageView', 'pageContent_HistPageView'];
  var tabNames = ['pageContent_MisTabStrip_descTab', 'pageContent_MisTabStrip_preRequisitesTab', 'pageContent_MisTabStrip_restrictionTab', 'pageContent_MisTabStrip_historyTab'];

	function injectSheet(url) {
    var tabStyle = document.createElement("link");
    tabStyle.type = "text/css";
    tabStyle.rel = "stylesheet";
    tabStyle.href = url;
    document.head.appendChild(tabStyle);
	}

  function injectSheets() {
    injectSheet("/gold/RadControls/TabStrip/Skins/ClassicBlue/styles.css");
    injectSheet("/gold/RadControls/Grid/Skins/Windows/Styles.css");
  }

  // The GOLD js is an absolute hellhole, so this is a miniscule bit of custome code to support switching 'tabs' in the description
  function tabSwitch(contentEle, index) {
    return function() {
      for(var i=0; i<4; i++) {
        if(i==index) continue;
        contentEle.querySelector('#' + blockNames[i]).style.display = 'none';
        contentEle.querySelector('#' + tabNames[i]).className = '';
      }
      contentEle.querySelector('#' + blockNames[index]).style.display = '';
      contentEle.querySelector('#' + tabNames[index]).className = 'selected';
    }
  }

  // Called when info has been loaded. Parse, prettify, and inject the description.
  function infoCallback(req, table) {
    var doc = document.implementation.createHTMLDocument('parse');
    doc.documentElement.innerHTML = req.responseText;
    var contentEle = doc.documentElement.querySelector('#content');
    
    if(!sheeted) {
    	//console.log(doc.documentElement.querySelector('link')); // works
    	//injectSheet(doc.documentElement.querySelector('link').href); // doesn't work
    	var sLink = doc.documentElement.querySelector('link').outerHTML.split('href')[1].split('"')[1] // sorry...
    	injectSheet(sLink)
    	sheeted = true;
    }

    // Prettification
    contentEle.style.paddingTop = '15px';
    contentEle.style.paddingLeft = '0px';
    contentEle.style.paddingRight = '0px';
    contentEle.style.paddingBottom = '0px';
    contentEle.removeChild(contentEle.querySelector('#pageContent_courseID'));
    contentEle.removeChild(contentEle.querySelector('br'));
    contentEle.removeChild(contentEle.querySelector('br'));
    var backtable = contentEle.querySelector('#pageContent_backBtn').parentElement.parentElement.parentElement;
    backtable.parentElement.removeChild(backtable);

    contentEle.querySelector('#pageContent_RadMultiPage1').style.minHeight='0px';

    // Tab-switching
    for(var i=0; i<4; i++) {
      var ele = contentEle.querySelector('#' + tabNames[i]);
      ele.addEventListener('click', tabSwitch(contentEle, i));
    }


    // Stick it in
    var row = document.createElement('tr');
    
    var col = document.createElement('td');
    col.setAttribute('colspan', 10);
    col.appendChild(contentEle);
    row.appendChild(col);
    table.tBodies[0].appendChild(row);

    // Loaded!
    table.querySelector('a').innerHTML = 'hide info';
  }
  
  // Called when you click on 'load info'. Fetches it, or toggles visibility.
  function infoClickHandler(table, target) {
    return function(e) {
    	e.preventDefault();
      var infoLink = table.querySelector('a');
      if(!table.loaded) { // first run
        var courseId = infoLink.id.split('_')[3];
        var infoLink = table.querySelector('a');
        var postbackForm = document.querySelector('#MainForm');
        var etarget = infoLink.href.split("'")[1];
        postbackForm.__EVENTTARGET.value = etarget;
        var fData = new FormData(postbackForm);
        var fReq = new XMLHttpRequest();
        fReq.addEventListener("load", function(req, table){
          return function(){infoCallback(req,table);};
        }(fReq, table), false);
        fReq.open("POST", window.location, true);
        fReq.send(fData);

        infoLink.innerHTML = 'loading...';
        table.loaded = true;
      }
      else { // already loaded; just toggle visibility
        var contentEle = table.querySelector('#content');
        if(contentEle.style.display == 'none') {
          contentEle.style.display = '';
          infoLink.innerHTML = 'hide info';
        }
        else {
          contentEle.style.display = 'none';
          infoLink.innerHTML = 'show info';
        }
      }
    };
  }

  
  
  // On search results page, inline course descriptions.
  if(window.location.toString().toLowerCase() == 'https://my.sa.ucsb.edu/gold/resultsfindcourses.aspx') {
    // Load some stylesheets
    injectSheets();

    // Set up hooks
    var tables = document.querySelectorAll('table.datatable');
    for(var i=0; i<tables.length; i++) {
      var infoLink = tables[i].querySelector('a');
      infoLink.innerHTML = 'load info';
      infoLink.addEventListener('click', infoClickHandler(tables[i]), false);
    }


  }
  // On schedule page, inline course descriptions
  else if(window.location.toString().toLowerCase() == 'https://my.sa.ucsb.edu/gold/studentschedule.aspx') {
    // Load some stylesheets
    injectSheets();

    // Set up hooks
    var divs = document.querySelectorAll('div.clcellprimaryalt');
    for(var i=0; i<divs.length; i++) {
      var table = divs[i].parentNode.parentNode.parentNode.parentNode;
      var infoLink = table.querySelector('a');
      infoLink.innerHTML = 'load info';
      infoLink.style.textDecoration = 'underline'; // you have no idea how negatively I feel about this
      infoLink.style.paddingLeft = '8px';
      infoLink.addEventListener('click', infoClickHandler(table), false);
    }
  }

}
