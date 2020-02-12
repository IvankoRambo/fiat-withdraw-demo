import React from 'react';
import { connect } from 'react-redux';

import FiatWithdraw from './services/FiatWithdraw';

import { defineServiceType } from '../actions';

const mapStateToProps = ({ services }) => ({
	services
});

const mapDispatchToProps = dispatch => ({
	defineServiceType: (currencyID, serviceID) => dispatch(defineServiceType(currencyID, serviceID))
});

class Service extends React.Component {
	constructor(props){
		super(props);
		this.renderServices = this.renderServices.bind(this);
		this.state = {
			serviceID: 'withdraw'
		};
	}

	componentDidMount() {
		this.props.defineServiceType('UAH', this.state.serviceID);
	}

	render(){
		let props = this.props;
		return (<section className={'l-service l-service--' + this.state.serviceID} ref="services" >
				{this.renderServices()}
			</section>);
	}

	renderServices(){
		switch(this.state.serviceID){
			case 'withdraw':
				return (<FiatWithdraw currentService={this.state.serviceID} currentCurrency="UAH" />);
			default:
				return (<div className='b-service b-service-no_service'>No service is defined</div>);
		}
		return (<Withdraw />);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Service);