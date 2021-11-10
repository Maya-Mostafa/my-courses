import * as React from 'react';
import styles from './MyCourses.module.scss';
import { IMyCoursesProps } from './IMyCoursesProps';
import {getLargeListItems} from  '../Services/DataRequests';
import IListItems from '../components/IListItems/IListItems';

export default function MyCourses (props: IMyCoursesProps){
  const [currListItems, setCurrListItems] = React.useState([]);
  const [preloaderVisible, setPreloaderVisible] = React.useState(false);

  React.useEffect(() => {
		setPreloaderVisible(true);
		getLargeListItems(
			props.context,
			props.siteCollection,
			props.listUrl,
			props.listName,
			props.pageSize
		).then((r) => {
			const formattedItems = r.filter((i) => i !== undefined);
			setCurrListItems(formattedItems);
			setPreloaderVisible(false);
		});
  }, []);
    
    return (
		<div className={styles.myCourses}>
			<h2>{props.wpTitle}</h2>
			<IListItems listItems={currListItems} preloaderVisible = {preloaderVisible}/>
		</div>
	);
}
