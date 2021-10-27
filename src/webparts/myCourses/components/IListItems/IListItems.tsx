import * as React from 'react';
import {IListItemsProps} from './IListItemsProps';
import styles from '../MyCourses.module.scss';
import {MessageBar, MessageBarType, Spinner} from 'office-ui-fabric-react';
import { ListView, IViewField, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";

export default function IListItems (props: IListItemsProps) {
  
  const viewFields:IViewField [] = [
    {
        name: 'formStatus',
        displayName: 'Status',
        sorting: true,
        minWidth: 150,
        maxWidth: 200,
        render : (item: any) => (
            <div>
                <div className={styles.formStatusCol}>
                    <span>{item.formTextStatus}</span>
                </div>
            </div>
        )
    },
    {
        name: 'title',
        displayName : 'Form Title',
        minWidth: 200,
        maxWidth: 250,
        sorting: true,
        isResizable: true,
        render : (item: any) => (
        <div>
            <a className={styles.defautlLink} target="_blank" data-interception="off" href={`${item.listUrl}/Lists/${item.listName}/DispForm.aspx?ID=${item.id}`}>{item.title}</a>
        </div>
        )
    },
    {
        name: 'fullName',
        displayName: 'Name',
        sorting: true,
        minWidth: 100,
        maxWidth: 150,
        render : (item: any) => (
            <div>
                <div>{item.fullName}</div>
            </div>
        )
    },
    {
        name: 'locationNo',
        displayName: 'Location No',
        minWidth: 100,
        maxWidth: 100,
        sorting: true,
        isResizable: true,
        render : (item: any) => (
        <div>
            {item.locationNo}
        </div>
        )
    },
    {
        name: 'formDetails',
        displayName: 'Details',
        minWidth: 150,
        maxWidth: 200,
        sorting: true,
        isResizable: true,
        render : (item: any) => (
        <div>
            {item.formDetails}
        </div>
        )
    },
    
  ];
  const groupByFields: IGrouping[] = [
    {
        name: "deptGrp", 
        order: GroupOrder.ascending 
    },
    {
        name: "subDeptGrp", 
        order: GroupOrder.ascending 
    }
  ];

  return(
    <div>
        <ListView
            items={props.items}
            viewFields={viewFields}
            groupByFields={groupByFields}
            // stickyHeader={true} 
        />
        {props.items.length === 0 && !props.preloaderVisible &&
            <MessageBar
                messageBarType={MessageBarType.warning}
                isMultiline={false}>
                Sorry, there is no data to display.
            </MessageBar>
        } 
        {props.preloaderVisible &&
            <div>
                <Spinner label="Loading data, please wait..." ariaLive="assertive" labelPosition="right" />
            </div>
        }
    </div>
  );
}





