// ==UserScript==
// @name					 GOLD Plus
// @namespace			http://kevingibbons.org
// @description		Checks the damn checkbox. Inline course descriptions in search results. Makes sidebar links actual links (new-tab-able).
// @include				https://my.sa.ucsb.edu/gold/*
// ==/UserScript==

// On login page, click damn box. Uncomment the second line and it'll log itself in, provided you have the correct credentials saved.
if(window.location.toString().toLowerCase().split('?')[0] == 'https://my.sa.ucsb.edu/gold/login.aspx') {
	
	document.getElementById('ctl00_pageContent_CredentialCheckBox').checked = true;
	//setTimeout(function(){document.getElementById('ctl00_pageContent_loginButton').click()}, 100);

}
else {
	// Not on the login page? Fix the sidebar. Set up some helper stuff used on several pages.
	var nav = document.querySelector('#ctl00_sidebarTable');
	if(nav) {
		nav.querySelector('#ctl00_ctl03').href = 'https://my.sa.ucsb.edu/gold/StudentSchedule.aspx';
		nav.querySelector('#ctl00_ctl05').href = 'https://my.sa.ucsb.edu/gold/BasicFindCourses.aspx';
		nav.querySelector('#ctl00_ctl07').href = 'https://my.sa.ucsb.edu/gold/RegistrationInfo.aspx';
		nav.querySelector('#ctl00_ctl09').href = 'https://my.sa.ucsb.edu/gold/Message.aspx';
		nav.querySelector('#ctl00_ctl11').href = 'https://my.sa.ucsb.edu/gold/StudentGrades.aspx';
		nav.querySelector('#ctl00_ctl13').href = 'https://my.sa.ucsb.edu/gold/MinimumCumulativeProgress.aspx';
		nav.querySelector('#ctl00_ctl15').href = 'https://my.sa.ucsb.edu/gold/AcademicProgress.aspx';
		nav.querySelector('#ctl00_ctl17').href = 'https://my.sa.ucsb.edu/gold/Address.aspx';
		nav.querySelector('#ctl00_ctl19').href = 'https://my.sa.ucsb.edu/gold/PersonalData.aspx';
		nav.querySelector('#ctl00_ctl21').href = 'https://my.sa.ucsb.edu/gold/TranscriptsVerifications.aspx';
		nav.querySelector('#ctl00_ctl23').href = 'https://my.sa.ucsb.edu/gold/Graduation.aspx';
		nav.querySelector('#ctl00_ctl25').href = 'https://my.sa.ucsb.edu/gold/Feedback.aspx';
	}
	
	// lol hardcoded names
	var blockNames = ['ctl00_pageContent_DescPageView', 'ctl00_pageContent_PreReqPageView', 'ctl00_pageContent_RestrictionPageView', 'ctl00_pageContent_HistPageView'];
	var tabNames = ['ctl00_pageContent_MisTabStrip_descTab', 'ctl00_pageContent_MisTabStrip_preRequisitesTab', 'ctl00_pageContent_MisTabStrip_restrictionTab', 'ctl00_pageContent_MisTabStrip_historyTab'];

	function injectSheets() {
		var tabStyle1 = document.createElement("link");
		tabStyle1.type = "text/css";
		tabStyle1.rel = "stylesheet";
		tabStyle1.href = "/gold/RadControls/TabStrip/Skins/ClassicBlue/styles.css";
		document.head.appendChild(tabStyle1);
		var tabStyle2 = document.createElement("link");
		tabStyle2.type = "text/css";
		tabStyle2.rel = "stylesheet";
		tabStyle2.href = "/gold/WebResource.axd?d=p0uCsW_E-MiVm1b86WXs1pdBcnKA9jHXGcRd-rjMy6-W3mD3pInbi9r6SWB_ceaJdECuofq42o1aQp7blL_GRBqB8_2GI77aEj42qZIp56vL7PlGKEt44011MI74FTjriWOo4VqhHPMgpKOuU0J9MJzdoZquNu1JV0nX8EjWkESpA2Rh0&amp;amp;t=634079871670000000";
		document.head.appendChild(tabStyle2);
		var tabStyle3 = document.createElement("link");
		tabStyle3.type = "text/css";
		tabStyle3.rel = "stylesheet";
		tabStyle3.href = "/gold/RadControls/Grid/Skins/Windows/Styles.css";
		document.head.appendChild(tabStyle3);
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

		// Prettification
		contentEle.style.paddingTop = '15px';
		contentEle.style.paddingLeft = '0px';
		contentEle.style.paddingRight = '0px';
		contentEle.style.paddingBottom = '0px';
		contentEle.removeChild(contentEle.querySelector('#ctl00_pageContent_courseID'));
		contentEle.removeChild(contentEle.querySelector('br'));
		contentEle.removeChild(contentEle.querySelector('br'));
		var backtable = contentEle.querySelector('#ctl00_pageContent_backBtn').parentElement.parentElement.parentElement;
		backtable.parentElement.removeChild(backtable);

		contentEle.querySelector('#ctl00_pageContent_RadMultiPage1').style.minHeight='0px';

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
		return function() {
			var infoLink = table.querySelector('a');
			if(!table.loaded) { // first run
				var courseId = infoLink.id.split('_')[3];
				var infoLink = table.querySelector('a');
				var courseId = infoLink.id.split('_')[3];
				var postbackForm = document.querySelector('#aspnetForm');
				postbackForm.__EVENTTARGET.value = 'ctl00$pageContent$CourseList$' + courseId + '$CourseDetailLink';
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
			infoLink.href = 'javascript:void(0)';
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
			infoLink.href = 'javascript:void(0)';
			infoLink.innerHTML = 'load info';
			infoLink.style.textDecoration = 'underline'; // you have no idea how negatively I feel about this
			infoLink.style.paddingLeft = '8px';
			infoLink.addEventListener('click', infoClickHandler(table), false);
		}
	}

}
