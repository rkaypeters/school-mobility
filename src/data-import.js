import {csv} from 'd3';

/// Promises for csv's

const mobstabdataPromise = csv('./data/mobstab18/school.csv',parseMobstab);
const metadataPromise = csv('./data/sch_metadata.csv',parseMetadata);
const geodataPromise = csv('./data/RI_Schools_coordinates_Mar2019.csv',parseGeodata);
const schEntersPromise = csv('./data/sch_enters_data_0809_1718.csv',parseEnterdata);
const leaMetadataPromise = csv('./data/lea_metadata.csv',parseLeaMetadata);


export {mobstabdataPromise,
  metadataPromise,
  geodataPromise,
  schEntersPromise,
  leaMetadataPromise};

//// Parse functions

function parseEnterdata(d){
    return{
        reportID: d.reportID,
        schcode_origin: d.schcode_origin_enter,
        schcode_dest: d.schcode_dest_enter,
        enters: +d.enters
    }
}

function parseMobstab(d){
    return{
        schyear: d.schYear,
        distcode: d.distcode,
        distname: d.distname,
        schcode: d.schcode,
        schname: d.schname,
        gradelevel: d.gradelevel,
        adm: d.adm,
        tot_enrolls: d.tot_enrolls,
        enrolls: d.enrolls,
        exits: d.exits,
        enrolls_yr: d.enrolls_yr,
        mobRate: d.mobRate,
        mobRate1: d.mobRate1,
        stabRate: d.stabRate
    }
}

function parseMetadata(d){
    return{
        schcode: d.SCH_CODE,
        schname: d.SCH_NAME,
        schname30: d.SCH_NAME30,
        schname15: d.SCH_NAME15,
        city: d.sch_city,
        lowGrade: d.SCH_LOW_GRADE,
        highGrade: d.SCH_HIGH_GRADE,
        status: d.SCH_STATUS,
        charter: d.SCH_CHARTER,
        magnet: d.SCH_MAGET,
        title1: d.SCH_TITLE1,
        gradeCfg: d.GRADECFG,
        distcode: d.DISTCODE,
        pk12: d.SCH_PK12,
        stateOp: d.SCH_STATE_OPERATED,
        adminSite: d.SCH_ADMINSITE
    }
    
    delete d.SCH_ADD1;
    delete d.SCH_ADD2;
    delete d.SCH_STATE;
    delete d.SCH_ZIP;
    delete d.EFFECTIVE_START_DATE;
    delete d.EFFECTIVE_END_DATE;
    delete d.OPENDATE;
    delete d.CLOSEDATE;
    
}

function parseLeaMetadata(d){
  return{
    distcode: d.LEA_CODE,
    distname: d.LEA_NAME,
    distname16: d.LEA_NAME16,
    distname8: d.LEA_NAME8,
    leaLowGrade: d.LEA_LOW_GRADE,
    leaHighGrade: d.LEA_HIGH_GRADE,
    leaType: d.LEA_TYPE
  }
  
  delete d.SUPTADDRL1;
  delete d.SUPTADDRL2;
  delete d.SUPTADDRL3;
  delete d.SUPTCITY;
  delete d.SUPTSATE;
  delete d.SUPTZIP;
  delete d.LEA;
}

function parseGeodata(d){
    return{
        schcode: d.SCH_CODE,
        schname: d.SCH_NAME,
        city: d.SCH_CITY,
        zip: d.SCH_ZIP,
        //lng: d.Longitude_geocode,
        //lat: d.Latitude_geocode
        lngLat: [+d.Longitude_geocode, +d.Latitude_geocode],
        schType: d.School_type_code
    }
    
    delete d.DISTCODE;
    delete d.School_address_for_geocode;
    delete d.SCH_STATE;
    delete d.SCH_STATUS;
    delete d.SCH_LEVEL_code;
    delete d.school_level;
    delete d.School_type;
    delete d.Update;
    delete d.updated_by;
    delete d.geocode_amentity;
}