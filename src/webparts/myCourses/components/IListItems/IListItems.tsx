import * as React from 'react';
import { IListItemsProps } from './IListItemsProps';
import {DetailsList, IColumn, SelectionMode, DetailsListLayoutMode, MessageBar, MessageBarType, Spinner} from 'office-ui-fabric-react';

export default function IListItems (props: IListItemsProps){

    const columns: IColumn[] = [
        {
          key: 'column1',
          name: 'Courses',
          minWidth: 80,
          maxWidth: 400,
          onRender : (item: any) => (
            <div>
                <a target="_blank" href={`https://pdsb1.sharepoint.com/MLP/Lists/${item.listName}/certificate.aspx?id=${item.id}`}>{item.title}</a>
            </div>
          )
        },
        {
            key: 'column2',
            name: 'Date Completed',
            minWidth: 80,
            maxWidth: 200,
            onRender : (item: any) => (
              <div>{item.dateCompleted}</div>
            )
        },
    ];

    return (
		<React.Fragment>
			<DetailsList
				items={props.listItems}
				columns={columns}
				isHeaderVisible={true}
				selectionMode={SelectionMode.none}
				layoutMode={DetailsListLayoutMode.justified}
			/>
			{props.listItems.length === 0 && !props.preloaderVisible && (
				<MessageBar
					messageBarType={MessageBarType.warning}
					isMultiline={false}
				>
					Sorry, there is no data to display.
				</MessageBar>
			)}
			{props.preloaderVisible && (
				<div>
					<Spinner
						label='Loading data, please wait...'
						ariaLive='assertive'
						labelPosition='right'
					/>
				</div>
			)}
		</React.Fragment>
	);
}