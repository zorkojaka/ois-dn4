// JavaScript Document

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function ustvariProfil() {
	sessionId = getSessionId();
	
		var ime = $("#UPime").val();
	var priimek = $("#UPpriimek").val();
	
	console.log(ime + " "+priimek);
	
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
			async: true,
		    type: 'POST',
		    success: function (data) {
		       var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
							var results = ehrId+" "+ime+" "+priimek;
							console.log(results);
							$("#UPprikazehr").html("EHR: " + ehrId);
		                }
		            },
		            error: function(err) {
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
		
	
	
	
}


function DodajTezo() {
	sessionId = getSessionId();

	var ehrId = $("#UPehr").val();
	var teza = $("#UPteza").val();
	var datum = $("#UPdatum").val();
	//oblika datuma in ure "2010-02-26T14:17"

		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datum,
		    "vital_signs/body_weight/any_event/body_weight": teza,    
		};
		
		var parZahtev = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parZahtev),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
				console.log("uspeh");
			},
		    error: function(err) {
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	
}

function PrikaziPodatke() {
	sessionId = getSessionId();	

	var ehr = $("#izbranEhr").val();


	if (!ehr || ehr.trim().length == 0) {
		console.log("ni Ehr ja")
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehr + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;

					$.ajax({
					    url: baseUrl + "/view/" + ehr + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var tabela = "<h3>"+party.firstNames + " " + party.lastNames+"</h3>"
								tabela += "<table class='table table-bordered table-condensed'><tr><th>Čas</th><th class='text-right'>Teža</th></tr>";
						        for (var i in res) {
						            tabela += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						        }
						        tabela += "</table>";
						        $("#prikaz").append(tabela);
					    	} else {
					    		
					    	}
					    },
					    error: function() {
							console.log("napaka" + JSON.parse(err.responseText).userMessage);
					    }
					});					
				
				
	    	},
	    	error: function(err) {
				console.log("napaka" + JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}


$(document).ready(function() {
	$('#vnesiEhr').change(function() {
		$("#izbranEhr").val($(this).val());
	});
});

