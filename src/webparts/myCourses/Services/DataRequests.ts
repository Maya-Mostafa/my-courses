import { WebPartContext } from "@microsoft/sp-webpart-base";
import {sp, Web} from "@pnp/sp/presets/all";
import {SPHttpClient} from "@microsoft/sp-http";

const getMyLocationsInfo = async (context: WebPartContext, locNum: string) =>{
  const   restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('schools')/items?$select=Title,School_x0020_My_x0020_School_x00,School_x0020_Name&$filter=Title eq '${locNum}'`,
          _data = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1);
  let locInfo : {} = {};
  
  if(_data.ok){
      const result = await _data.json();
      locInfo = {key: result.value[0].Title, text: `${result.value[0].School_x0020_Name} (${result.value[0].Title})` };
  }
  return locInfo;
};
const getMyLocations = async (context: WebPartContext) =>{
  const   currUserEmail = context.pageContext.user.email,
          restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${currUserEmail}'&$select=MMHubLocationNos`;

  const myLocs = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then(response => response.json());
  const myLocsNum : [] = myLocs.value[0].MMHubLocationNos.split(";");

  return myLocsNum;
};
export const getMyLocsDpd = async (context: WebPartContext) =>{
  const myLocsNos = await getMyLocations(context).then(r=>r);
  const myLocsDpd = [];
  
  for(let myLocNo of myLocsNos){
    const myLocDpd = await getMyLocationsInfo(context, myLocNo);//.then(r=>r);
    myLocsDpd.push(myLocDpd);
  }

  return Promise.all(myLocsDpd);
};

const getListItems = async (context: WebPartContext, listUrl: string, listName: string, listDisplayName: string, pageSize: number, locNo: string) =>{
  
  const listData: any = [];
  //const currUserEmail = context.pageContext.user.email;

  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items?$top=${pageSize}&$filter=substringof('${locNo}', LocationNo)`;
  
  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1); //.then(r => r.json());
    if (response.ok){
      const results = await response.json();
      if(results){
        console.log(`${responseUrl} - Results: ${results.value.length}`);
        results.value.map((item: any)=>{
          listData.push({
            id: item.Id,
            title: item.Form_x0020_Title || "",
            formStatus: item.FormStatus || "",
            
            fullName: item.FullName1 || "",
            formDetails: item.FormDetail || "",
            deptGrp: item.DeptSubDeptGroupings.substring(0, item.DeptSubDeptGroupings.indexOf('|')),
            subDeptGrp: item.DeptSubDeptGroupings.substring(item.DeptSubDeptGroupings.indexOf('|')+1),
            listUrl: listUrl,
            listName: listName,
            listDisplayName: listDisplayName,
            locationNo: item.LocationNo || "",
            locationName: item.LocationNames || "",
            posGroup: item.POSGroup || ""
          });
        });
      }
    }
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List Items: " + listName);
  }

  return listData;
};
export const readAllLists = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number) =>{
  const listData: any = [];
  let aggregatedListsPromises : any = [];
  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
    response.value.map((item: any)=>{
      listData.push({
        listName: item.Title,
        listDisplayName: item.ListDisplayName,
        listUrl: item.ListUrl
      });
    });
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List(s): " + listName);
  }

  const myLocs = await getMyLocations(context).then(r => r);
  for (let myLoc of myLocs){
    listData.map((listItem: any)=>{
      aggregatedListsPromises = aggregatedListsPromises.concat(getListItems(context, listItem.listUrl, listItem.listName, listItem.listDisplayName, pageSize, myLoc));
    });
  }

  return Promise.all(aggregatedListsPromises);
};

//Paging functions
const parseFilter = (filterStat: string, query: string, columnName: string) =>{
  filterStat === '' ? filterStat += `substringof('${query}', ${columnName})` : filterStat += ` and substringof('${query}', ${columnName})`;
  return filterStat;
};
const getLargeListItems = async (context: WebPartContext, listUrl: string, listName: string, listDisplayName: string, pageSize: number, locNo: string, filterFields?: any) =>{
  sp.setup({
    spfxContext: context
  });
  const web = Web(listUrl);
  const results:  any = [];
  let filterStat = '';

  // console.log("filterfields", filterFields);
  
  if (!isObjectEmpty(filterFields)){
    if (filterFields.title.key){
      filterStat = parseFilter(filterStat, filterFields.title.key, 'Form_x0020_Title');
    }
    if (filterFields.formStatus.key){
      filterStat = parseFilter(filterStat, filterFields.formStatus.key, 'FormStatus');
    }
    if (filterFields.formDetails){
      filterStat = parseFilter(filterStat, filterFields.formDetails, 'FormDetail');
    }
    if (filterFields.fullName){
      filterStat = parseFilter(filterStat, filterFields.fullName, 'FullName1');
    }
    if (filterFields.locationNo.key){
      filterStat = parseFilter(filterStat, filterFields.locationNo.key, 'LocationNo');
    }
  }

  // console.log("filterStat", filterStat);

  const response : any =  await web.lists
    .getByTitle(listName)
    .items
    // .filter(filterStat)
    .filter(`substringof('${locNo}', LocationNo) ${filterStat ? 'and ' + filterStat : ''}`)
    .top(pageSize)
    .getPaged();

  response.results.map((item: any)=>{
    results.push({
      id: item.Id,
      title: item.Form_x0020_Title || "",
      formStatus: item.FormStatus || "",
      
      fullName: item.FullName1 || "",
      formDetails: item.FormDetail || "",
      deptGrp: item.DeptSubDeptGroupings.substring(0, item.DeptSubDeptGroupings.indexOf('|')),
      subDeptGrp: item.DeptSubDeptGroupings.substring(item.DeptSubDeptGroupings.indexOf('|')+1),
      listUrl: listUrl,
      listName: listName,
      listDisplayName: listDisplayName,
      locationNo: item.LocationNo || "",
      locationName: item.LocationNames || "",
      posGroup: item.POSGroup || ""
    });
  });

  const listInfo = {
    listUrl: listUrl,
    listName: listName,
    listDisplayName: listDisplayName
  };
  
  return [results, response, listInfo];
};
const getNextResults = async (responseObj: any) =>{
  const nextResults: any = [];
  let nextResponse: any;
  const response = responseObj[0];
  const listInfo = responseObj[1];

  if (response && response.hasNext){
    nextResponse = await response.getNext();
    nextResponse.results.map((item)=>{
      nextResults.push({
        id: item.Id,
        title: item.Form_x0020_Title || "",
        formStatus: item.FormStatus || "",
        
        fullName: item.FullName1 || "",
        formDetails: item.FormDetail || "",
        deptGrp: item.DeptSubDeptGroupings.substring(0, item.DeptSubDeptGroupings.indexOf('|')),
        subDeptGrp: item.DeptSubDeptGroupings.substring(item.DeptSubDeptGroupings.indexOf('|')+1),
        listUrl: listInfo.listUrl,
        listName: listInfo.listName,
        listDisplayName: listInfo.listDisplayName,
        locationNo: item.LocationNo || "",
        locationName: item.LocationNames || "",
        posGroup: item.POSGroup || ""  
      });
    });
  }

  return [nextResults, nextResponse, listInfo];
};
export const readBatchItems = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number, filterFields?: any) =>{
  const listData: any = [];
  let aggregatedLargeListItems: any = [];
  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
    response.value.map((item: any)=>{
      listData.push({
        listName: item.Title,
        listDisplayName: item.ListDisplayName,
        listUrl: item.ListUrl
      });
    });
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List(s): " + listName);
  }

  const myLocs = await getMyLocations(context).then(r => r);
  for (let myLoc of myLocs){
    listData.map((listItem: any)=>{
      aggregatedLargeListItems = aggregatedLargeListItems.concat(getLargeListItems(context, listItem.listUrl, listItem.listName, listItem.listDisplayName, pageSize, myLoc, filterFields));
    });
  }

  return Promise.all(aggregatedLargeListItems);
};
export const readNextBatchItems = async (nextResponse: any) =>{
  let aggregatedListsPromises : any = [];
  
  nextResponse.map(nr =>{
    aggregatedListsPromises = aggregatedListsPromises.concat(getNextResults(nr));
  });

  return Promise.all(aggregatedListsPromises);
};

export const isObjectEmpty = (items: any): boolean=>{
  let isEmpty:boolean = true;
  for (const item in items){
    isEmpty = items[item] === "" && isEmpty ;
  }
  return isEmpty;
};
export const uniq = (arr: any) => {
  const prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

  return arr.filter(function(item) {
      var type = typeof item;
      if(type in prims)
          return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
      else
          return objs.indexOf(item) >= 0 ? false : objs.push(item);
  });
};
export const arrayUnique = (arr, uniqueKey) => {
  const flagList = [];
  return arr.filter(function(item) {
    if (flagList.indexOf(item[uniqueKey]) === -1) {
      flagList.push(item[uniqueKey]);
      return true;
    }
  });
};