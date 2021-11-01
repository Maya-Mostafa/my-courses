import * as React from 'react';
import {IFilterFieldsProps} from './IFilterFieldsProps';
import {Stack, IStackProps, IStackStyles, SearchBox, ActionButton, initializeIcons} from 'office-ui-fabric-react';
import styles from '../MyCourses.module.scss';
import {isObjectEmpty} from '../../Services/DataRequests';

export default function IFilterFields (props: IFilterFieldsProps) {
    
    initializeIcons();
    const stackTokens = { childrenGap: 50 };
    const stackStyles: Partial<IStackStyles> = { root: { width: '100%' } };
    const columnProps: Partial<IStackProps> = {
        tokens: { childrenGap: 15 },
        styles: { root: { width: '50%' } },
    };
    
    return(
        <div className={styles.filterForm}>            
            <ActionButton 
                className={styles.resetSrchBtn}
                text="Reset" 
                onClick={props.resetSrch} 
                iconProps={{ iconName: 'ClearFilter' }}
                allowDisabledFocus 
                disabled = {isObjectEmpty(props.filterField)}
            />
            <div>
            <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                    <Stack {...columnProps}>                        
                    <SearchBox 
                            placeholder="Course Title" 
                            underlined
                            value={props.filterField.firstName}
                            onChange={props.onChangeFilterField("firstName")}
                            iconProps={{ iconName: 'Location' }}
                        />
                        <SearchBox 
                            placeholder="Job Title"
                            underlined 
                            value={props.filterField.jobTitle} 
                            onChange={props.onChangeFilterField("jobTitle")}
                            iconProps={{iconName: 'Contact'}}
                        />
                        <SearchBox 
                            placeholder="P Number"
                            underlined 
                            value={props.filterField.pNumber} 
                            onChange={props.onChangeFilterField("pNumber")}
                            iconProps={{iconName: 'Contact'}}
                        />
                    </Stack>
                    <Stack {...columnProps}>
                    <SearchBox 
                            placeholder="Last Name" 
                            underlined 
                            value={props.filterField.lastName} 
                            onChange={props.onChangeFilterField("lastName")}
                            iconProps={{iconName: 'NumberSymbol'}}
                        />
                        <SearchBox 
                            placeholder="Location" 
                            underlined 
                            value={props.filterField.location} 
                            onChange={props.onChangeFilterField("location")} 
                            iconProps={{iconName: 'AlignJustify'}}
                        />
                    </Stack>
                </Stack>
            </div>
        </div>
    );
}