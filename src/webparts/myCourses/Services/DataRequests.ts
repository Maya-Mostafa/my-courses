import { WebPartContext } from "@microsoft/sp-webpart-base";
import {sp, Web} from "@pnp/sp/presets/all";
import {SPHttpClient} from "@microsoft/sp-http";

const parseFilter = (filterStat: string, query: string, columnName: string) =>{
  filterStat === '' ? filterStat += `substringof('${query}', ${columnName})` : filterStat += ` and substringof('${query}', ${columnName})`;
  return filterStat;
};

const isCourseCompleted = async (context: WebPartContext, list : {url: string, name: string}) => {
  let completedCourse = null;
  const currUserEmail = context.pageContext.user.email;
  console.log("context.pageContext.legacyPageContext", context.pageContext.legacyPageContext);
  const responseUrl = `${list.url}/_api/web/Lists/GetByTitle('${list.name}')/items?$select=Id,Modified,Author/EMail&$expand=Author&$filter=Author/EMail eq '${currUserEmail}'`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
    if (response.value.length !== 0){
      completedCourse =  {id: response.value[0].Id, dateCompleted: response.value[0].Modified}
      console.log("completedCourse", completedCourse);
    }
    return false;
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List(s): " + list.name);
  }

  return completedCourse;
};

const parseListUrl = (fullListUrl: string) =>{
  let fullUrl = fullListUrl.toLowerCase();
  return fullUrl.substring(0, fullUrl.indexOf('/lists/'))
};

export const getLargeListItems = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number, filterFields?: any) =>{
  sp.setup({
    spfxContext: context
  });
  
  //sp.web.currentUser.get().then(data => console.log("sp.web.currentUser", data))

  const web = Web(listUrl);
  const results:  any = [], completedCourses: any = [];
  let filterStat = '';
  
  if (!isObjectEmpty(filterFields)){
    if (filterFields.firstName){
      filterStat = parseFilter(filterStat, filterFields.firstName, 'FirstName');
    }
    if (filterFields.lastName){
      filterStat = parseFilter(filterStat, filterFields.lastName, 'LastName');
    }
    if (filterFields.location){
      filterStat = parseFilter(filterStat, filterFields.location, 'MMHubShoolName');
    }
    if (filterFields.jobTitle){
      filterStat = parseFilter(filterStat, filterFields.jobTitle, 'JobTitle');
    }
    if (filterFields.pNumber){
      filterStat = parseFilter(filterStat, '0'+filterFields.pNumber.substring(1), 'MMHubEmployeeNo');
    }
  }

  const response : any =  await web.lists
    .getByTitle(listName)
    .items
    //.filter(filterStat)
    .top(pageSize)
    .getPaged();
    
  for (let item of response.results){
    let isCourseCompletedResponse = await isCourseCompleted(context, {url: parseListUrl(item.URL.Url), name: item.ListName});
    //console.log(isCourseCompletedResponse);
    if (isCourseCompletedResponse){
      completedCourses.push({
        id: isCourseCompletedResponse.id,
        title: item.Title,
        dateCompleted: isCourseCompletedResponse.dateCompleted,
      })
    }
  }

  console.log("completedCourses", completedCourses);
  /*response.results.map((item: any)=>{
    results.push({
      id: item.Id,
      title: item.Title,
      listUrl: item.URL.Url,
      listName: item.ListName
    });
  });*/
  
  return [completedCourses, response];
};

export const getNextResults = async (response: any) =>{
  const nextResults: any = [];
  let nextResponse: any;

  if (response.hasNext){
    nextResponse = await response.getNext();
    nextResponse.results.map((item)=>{
      nextResults.push({
        id: item.Id,
        title: item.Title,
        // listUrl: item.URL.Url,
        // listName: item.ListName
      });
    });
  }

  return [nextResults, nextResponse];
};






export const isObjectEmpty = (items: any): boolean=>{
  let isEmpty:boolean = true;
  for (const item in items){
    isEmpty = items[item] === "" && isEmpty ;
  }
  return isEmpty;
};