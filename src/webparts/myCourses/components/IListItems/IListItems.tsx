import * as React from 'react';
import styles from '../MyCourses.module.scss';
import { IListItemsProps } from './IListItemsProps';
import {DetailsList, IColumn, SelectionMode, DetailsListLayoutMode, initializeIcons, Icon, Persona, PersonaSize, PersonaPresence} from 'office-ui-fabric-react';


export default function IListItems (props: IListItemsProps){

    const columns: IColumn[] = [
        {
          key: 'column1',
          name: 'title',
          minWidth: 80,
          maxWidth: 200,
          onRender : (item: any) => (
            <div>
                <a href=''>{item.title}</a>
            </div>

          )
        },
        // {
        //     key: 'column4',
        //     name: 'pNumber',
        //     minWidth: 80,
        //     maxWidth: 200,
        //     onRender : (item: any) => (
        //       <div>{item.empNo}</div>
        //     )
        // },
        // {
        //   key: 'column2',
        //   name: 'jobTitleLocs',
        //   minWidth: 80,
        //   maxWidth: 300,
        //   onRender : (item: any) => (
        //     <div>
        //       <div>{item.jobTitle}</div>
        //       <div>{item.locNames}</div>
        //     </div>
        //   )
        // },
        // {
        //   key: 'column3',
        //   name: 'email',
        //   minWidth: 80,
        //   maxWidth: 80,
        //   onRender : (item: any) => (
        //     <a href={`mailto:${item.email}`} target="_blank">{item.email}</a>
        //   )
        // },
    ];

    return(
        <DetailsList
            items={props.listItems}
            columns={columns}
            isHeaderVisible={false}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
        />
    );
}