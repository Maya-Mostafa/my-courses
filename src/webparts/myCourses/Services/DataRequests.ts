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
const getCurrentUserId = async (context: WebPartContext) =>{
  const responseUrl = 'https://pdsb1.sharepoint.com/_api/web/currentUser';
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
  return response.Id;
};

const isCourseCompleted = async (context: WebPartContext, list : {url: string, name: string, title: string}, currUserId: string) => {
  let completedCourse = null;
    
  const responseUrl = `https://pdsb1.sharepoint.com/MLP/_api/web/Lists/GetByTitle('${list.name}')/items?$filter=AuthorId eq '${currUserId}'`;

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

export const getLargeListItems = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number, filterFields?: any) =>{ 
  const currUserId = await getCurrentUserId(context);

  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items?$top=${pageSize}`;
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
  const allListsResults = response.value;

  let completedCourses: any = [];
  allListsResults.map((listResult: any)=>{
      completedCourses = completedCourses.concat(isCourseCompleted(context, {url: parseListUrl(listResult.URL.Url), name: listResult.ListName, title: listResult.Title}, currUserId));
  });
  return Promise.all(completedCourses);
};




