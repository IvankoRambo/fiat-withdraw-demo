import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import qs from 'query-string';
import InternalMain from './InternalMain';
import { connect } from 'react-redux';
import { setPageRefresh, setSocketClose } from '../actions';

const mapStateToProps = ({ resourceMgr, userLang, defaultLang }) => ({
    resourceMgr,
    userLang,
    defaultLang
});

const mapDispatchToProps = dispatch => ({
});

class InternalApp extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			serviceCompleteSuccess: false,
			serviceCompleteFail: false,
			status: false
		};
	};

	componentDidMount() {
		const getParams = qs.parse(this.props.location.search);
	}

	render(){
		const state = this.state;
		const props = this.props;
		return (<React.Fragment>
				<div className='b-middle-row'>
					<InternalMain />
				</div>
			</React.Fragment>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InternalApp);