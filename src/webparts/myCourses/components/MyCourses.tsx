import * as React from 'react';
import styles from './MyCourses.module.scss';
import { IMyCoursesProps } from './IMyCoursesProps';

import {PrimaryButton} from 'office-ui-fabric-react';
import {getLargeListItems, getNextResults} from  '../Services/DataRequests';
import IListItems from '../components/IListItems/IListItems';
import IFilterFields from '../components/IFilterFields/IFilterFields';

export default function MyCourses (props: IMyCoursesProps){
  const [currListItems, setCurrListItems] = React.useState([]);
    const [nextObj, setNextObj] = React.useState([]);
    const [historyIndex, setHistoryIndex] = React.useState(0);
    const [historyItems, setHistoryItems] = React.useState([]);
    const [nextDisabled, setNextDisabled] = React.useState(false);

    //const [filteredListItems, setFilteredListItems] = React.useState(currListItems);
    const [filterFields, setFilterFields] = React.useState({
      firstName: "",
      lastName: "",
      location: "",
      jobTitle: "",
      pNumber: ""
    });
    const [debouncedFilterFields, setDebouncedFitlerFields] = React.useState(filterFields);

    React.useEffect(()=>{
      getLargeListItems(props.context, props.listUrl, props.listName, props.pageSize).then( r =>{
        setCurrListItems(r[0]);
        setNextObj(r[1]);        
        setHistoryItems([r[0]]);
        setHistoryIndex(0);
      });
    }, []);

    React.useEffect(()=>{
      const timeOutId = setTimeout(()=>{
        setDebouncedFitlerFields(filterFields);
      }, 200);
      return () =>{
        clearTimeout(timeOutId);
      };
    }, [filterFields]);

    React.useEffect(()=>{
      const search = () =>{
        getLargeListItems(props.context, props.listUrl, props.listName, props.pageSize, debouncedFilterFields).then( r =>{
          setCurrListItems(r[0]);
          setNextObj(r[1]);        
          setHistoryItems([r[0]]);
          setHistoryIndex(0);
          setNextDisabled(r[1].nextUrl ? false : true);
        });
      };
      if (debouncedFilterFields){
        search();
      }
    }, [debouncedFilterFields]);


    const onNextClick = () =>{
      if (historyItems.length - 1 === historyIndex){
        getNextResults(nextObj).then( r =>{
          setCurrListItems(r[0]);
          setNextObj(r[1]);
          
          let historyArr = historyItems;
          historyArr.push(r[0]);
          setHistoryItems(historyArr);
          setHistoryIndex(historyIndex + 1);

          setNextDisabled(r[1].nextUrl ? false : true);
        });
      }else{
        setHistoryIndex(historyIndex + 1);
        setCurrListItems(historyItems[historyIndex + 1]);
        if (historyItems.length - 1 === historyIndex){
          setNextDisabled(true);
        }
      }
    };

    const onPrevClick = () =>{
      if (historyIndex > 0){
        setHistoryIndex(historyIndex - 1);
        setCurrListItems(historyItems[historyIndex - 1]);
        setNextDisabled(false);
      }
    };

    const onChangeFilterField = (fieldNameParam: string) =>{
      return(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) =>{      
        setFilterFields({
          ...filterFields,
          [fieldNameParam] : text
        });
      };
    };
    
    const resetSrch = () =>{
      setFilterFields({
        firstName: "",
        lastName: "",
        location: "",
        jobTitle: "",
        pNumber: ""
      });
    };

    return (
      <div className={ styles.myCourses }>
        
        <h2>{props.wpTitle}</h2>
        
        <IFilterFields 
          filterField={filterFields} 
          onChangeFilterField={onChangeFilterField} 
          resetSrch={resetSrch}
        />

        <div className={styles.pagingBtns}>
          <PrimaryButton disabled={historyIndex > 0 ? false : true} iconProps={{iconName: 'ChevronLeftMed'}} onClick={onPrevClick}/>
          <PrimaryButton disabled={nextDisabled} iconProps={{iconName: 'ChevronRightMed'}} onClick={onNextClick}/>
        </div>
        
        <IListItems
          listItems = {currListItems}           
        />
        
      </div>
    );
}
