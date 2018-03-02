//https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
//and custom correction to  LHDT (+11)
function getTz (tzName, lat, lng){
    timeZoneList = {"ACDT": 10.5, "ACST": 9.5, "ACT": -5, "ACWST": 8.75, "ADT": -3, "AEDT": 11, "AEST": 10, 
    "AFT": 4.5, "AKDT": -8, "AKST": -9, "AMST": -3, "ART": -3,
    "AWST": 8, "AZOST": 0, "AZOT": -1, "AZT": 4, "BDT": 8, "BIOT": 6, "BIT": -12, "BOT": -4, "BRST": -2, 
    "BRT": -3, "BTT": 6, "CAT": 2, "CCT": 6.5, "CEST": 2, "CET": 1, "CHADT": 13.75, 
    "CHAST": 12.75, "CHOT": 8, "CHOST": 9, "CHST": 10, "CHUT": 10, "CIST": -8, "CIT": 8, "CKT": -10, "CLST": -3, 
    "CLT": -4, "COST": -4, "COT": -5, "CT": 8, "CVT": -1, "CWST": 8.75, "CXT": 7, "DAVT": 7, "DDUT": 10, "DFT": 1,
    "EASST": -5, "EAST": -6, "EAT": 3, "EDT": -4, "EEST": 3, "EET": 2, "EGST": 0, "EGT": -1, 
    "EIT": 9, "EST": -5, "FET": 3, "FJT": 12, "FKST": -3, "FKT": -4, "FNT": -2, "GALT": -6, "GAMT": -9, "GET": 4, 
    "GFT": -3, "GILT": 12, "GIT": -9, "GMT": 0, "GYT": -4, "HDT": -9, "HAEC": 2, "HST": -10, 
    "HKT": 8, "HMT": 5, "HOVST": 8, "HOVT": 7, "ICT": 7, "IDT": 3, "IOT": 3, "IRDT": 4.5, "IRKT": 8, "IRST": 3.5, 
   "JST": 9, "KGT": 6, "KOST": 11, "KRAT": 7, "KST": 9, "LHST": 10.5, "LHDT": 11, 
    "LINT": 14, "MAGT": 12, "MART": -8.5, "MAWT": 5, "MDT": -6, "MET": 1, "MEST": 2, "MHT": 12, "MIST": 11, 
    "MIT": -8.5, "MMT": 6.5, "MSK": 3, "MUT": 4, "MVT": 5, "MYT": 8, "NCT": 11, "NDT": -1.5, 
    "NFT": 11, "NPT": 5.75, "NST": -2.5, "NT": -2.5, "NUT": -11, "NZDT": 13, "NZST": 12, "OMST": 6, "ORAT": 5, 
    "PDT": -7, "PET": -5, "PETT": 12, "PGT": 10, "PHOT": 13, "PHT": 8, "PKT": 5, "PMDT": -2, "PMST": -3, 
    "PONT": 11, "PYST": -3, "PYT": -4, "RET": 4, "ROTT": -3, "SAKT": 11, "SAMT": 4, 
    "SAST": 2, "SBT": 11, "SCT": 4, "SDT": -10, "SGT": 8, "SLST": 5.5, "SRET": 11, "SRT": -3,
    "SYOT": 3, "TAHT": -10, "THA": 7, "TFT": 5, "TJT": 5, "TKT": 13, "TLT": 9, "TMT": 5, "TRT": 3, 
    "TOT": 13, "TVT": 12, "ULAST": 9, "ULAT": 8, "USZ1": 2, "UTC": 0, "UYST": -2, "UYT": -3, "UZT": 5, "VET": -4, 
    "VLAT": 10, "VOLT": 4, "VOST": 6, "VUT": 11, "WAKT": 12, "WAST": 2, "WAT": 1, "WEST": 1, "WET": 0, "WIT": 7, 
    "WST": 8, "YAKT": 9, "YEKT": 5};
    
    var td;

    if (timeZoneList[tzName]) {
        td =  timeZoneList[tzName];
    } else {
        // Armenia time, Amazon time
        if (tzName == 'AMT'){
            if (lng > 0){ // Armenia
                td =  4;
            } else {
                td =  -4; // Amazon
            }
        }
        // Arabia Standard Time, Atlantic Standard Time
        else if (tzName == 'AST'){
            if (lng > 0){ // Arabia
                td =  3;
            } else {
                td =  -4; //Atlantic
            }
        }
        // Bangladesh Standard Time / Bougainville Standard Time / British Summer Time
        else if (tzName == 'BST'){
            if (lng > 100){ // Bougainville
                td =  11;
            } else if (lng < 20) { // British Summer Time
                td =  1; 
            } else { // Bangladesh
                td =  6;
            }
        }
        // Cuba Standard Time, China Standard Time, Central Standard Time
        else if (tzName == 'CST') {
            if (lng > 0){ // China
                td =  8;
            } else {
                if (lng > -85.34 && lat < 22.26) { // Cuba
                    td =  -5;
                } else { // North America CST
                    td =  -6;
                }
            }
        }  
        // Cuba Daylight Time, Central Daylight Time
        else if (tzName == 'CDT'){
            if (lng > -85.34 && lat < 22.26) { // Cuba
                td =  -4;
            } else { // North America CDT
                td =  -5;
            }
        }
        // Eastern Caribbean Time, Ecuador Time
        else if (tzName == 'ECT'){
            if (lat > 2) { // Caribbean
                td =  -4;
            } else { // Ecuador
                td =  -5;
            }
        }
        // South Georgia and the South Sandwich Islands Time, Gulf Standard Time
        else if (tzName == 'GST'){
            if (lng > 0){ // Gulf
                td =  4;
            } else { // SSI
                td =  -2; 
            }
        }
        // Indian Standard Time, Irish Standard Time, Israel Standard Time
        else if (tzName == 'IST'){
            if (lng > 65){ // India
                td =  5.5;
            } else if (lng < 20) { // Ireland
                td =  1; 
            } else { // Israel
                td =  2;
            }
        }
        // Malaysia / Mountain Standard time
        else if (tzName == 'MST'){
            if (lng > 0){ // Malaysia
                td =  8;
            } else {
                td =  -7; // Mountain
            }
        }
        // Pacific Standard Time (North America) / Philippine Standard Time
        else if (tzName == 'PST'){
            if (lng > 0){ // Philippine Standard Time
                td =  8;
            } else {
                td =  -8; // Pacific Standard Time (North America)
            }
        }
        // Samoa Standard Time / Singapore Standard Time
        else if (tzName == 'SST'){
            if (lng > 0){ // Singapore Standard Time
                td =  8;
            } else {
                td =  -11; // Samoa Standard Time
            }
        }

    }
    return td;
}

