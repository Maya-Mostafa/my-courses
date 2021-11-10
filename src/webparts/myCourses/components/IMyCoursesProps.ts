import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IMyCoursesProps {
  wpTitle: string;
  context: WebPartContext;
  listUrl: string;
  listName: string;
  pageSize: number;
  siteCollection: string;
}
