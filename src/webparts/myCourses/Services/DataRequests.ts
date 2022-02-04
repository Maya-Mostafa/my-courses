import { WebPartContext } from "@microsoft/sp-webpart-base";
import {SPHttpClient} from "@microsoft/sp-http";
import * as moment from 'moment';

export const isObjectEmpty = (items: any): boolean=>{
  let isEmpty:boolean = true;
  for (const item in items){
    isEmpty = items[item] === "" && isEmpty ;
  }
  return isEmpty;
};
const parseListUrl = (fullListUrl: string) =>{
  let fullUrl = fullListUrl.toLowerCase();
  return fullUrl.substring(0, fullUrl.indexOf('/lists/'));
};
const getCurrentUserId = async (context: WebPartContext, siteCollection: string) =>{
  const responseUrl = `${siteCollection}/_api/web/currentUser`;
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
  return response.Id;
};

const isCourseCompleted = async (context: WebPartContext, list : {url: string, name: string, title: string}, currUserId: string, filterField: string) => {
  let completedCourse = null;
  const currentUserEmail = context.pageContext.user.email;
  
  let responseUrl = `${list.url}/_api/web/Lists/GetByTitle('${list.name}')/items?$filter=AuthorId eq '${currUserId}'`;
  if (filterField === 'BoardEmail')
    responseUrl = `${list.url}/_api/web/Lists/GetByTitle('${list.name}')/items?$filter=BoardEmail eq '${currentUserEmail}'`;    

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
    if (response.value.length !== 0){
      completedCourse = { 
        id: response.value[0].Id, 
        dateCompleted: moment(response.value[0].Modified).format('MM/DD/YYYY'),
        title: list.title,
        listName: list.name
      };
      return completedCourse;
    }
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List(s): " + list.name);
  }
};

export const getLargeListItems = async (context: WebPartContext, siteCollection: string, listUrl: string, listName: string, pageSize: number, filterFields?: any) =>{ 
  const currUserId = await getCurrentUserId(context, siteCollection);

  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items?$top=${pageSize}`;
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
  const allListsResults = response.value;

  let completedCourses: any = [];
  allListsResults.map((listResult: any)=>{
      completedCourses = completedCourses.concat(isCourseCompleted(context, {url: listUrl, name: listResult.ListName, title: listResult.Title}, currUserId, listResult.UserFilterBy));
      // completedCourses = completedCourses.concat(isCourseCompleted(context, {url: parseListUrl(listResult.URL.Url), name: listResult.ListName, title: listResult.Title}, currUserId));
  });
  return Promise.all(completedCourses);
};




