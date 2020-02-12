import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

import { listSavedCards, selectCard, responseStatus, toggleWithdraw } from '../../actions';
import { formatErrorMessage } from '../../scripts/lib/errorHelper';
import { getJson } from '../../scripts/httpHandler';

let confirmFiatWithdrawTimer = null;

let timeToShow = 4000;

const mapStateToProps = ({ urls, accounts, services, cards, fiatWithdrawFeatures, responseStatus, remoteAddress, resourceMgr, userLang, defaultLang, fiatWithdrawFee, serviceResources }) => ({
	urls,
	accounts,
	services,
	cards,
	fiatWithdrawFeatures,
	responseStatus,
	remoteAddress,
	resourceMgr,
	userLang,
	defaultLang,
	fiatWithdrawFee,
	serviceResources
});

const mapDispatchToProps = dispatch => ({
	savedCards: (endpoint) => {
		getJson(endpoint)
			.then(json => {
				dispatch(listSavedCards(json));
			});
	},
	selectCard: (cardID) => dispatch(selectCard(cardID)),
	toggleWithdraw: (toggleType) => dispatch(toggleWithdraw(toggleType)),
	getAllAccountSum: (props, context) => {
		getAllAccountSum('fiatWithdrawFee', 'GET_FULL_SUM_FIAT_WITHDRAW', dispatch, responseStatus, props.resourceMgr, props, context);
	}
});

class FiatWithdraw extends React.Component {
	componentWillMount(){
		if (!this.props.mode) {
			this.props.savedCards(this.props.urls.host + this.props.urls.sections.cards);
		}
	}

	componentWillUnmount(){
		this.props.refreshResponseStatus();
	}

	constructor(props){
		super(props);
		this.changeCardState = this.changeCardState.bind(this);
		this.openFiatWithdrawConfirmPopup = this.openFiatWithdrawConfirmPopup.bind(this);
		this.hideFiatWithdrawConfirmPopup = this.hideFiatWithdrawConfirmPopup.bind(this);
		this.renderFiatWithdrawConfirm = this.renderFiatWithdrawConfirm.bind(this);
		this.toggleWithdrawState = this.toggleWithdrawState.bind(this);
		this.setTypeLimit = this.setTypeLimit.bind(this);
		this.toggleInclusiveFee = this.toggleInclusiveFee.bind(this);
		this.calculateAmountFee = this.calculateAmountFee.bind(this);
		this.toggleSelect = this.toggleSelect.bind(this);
		this.getAllAccountSum = this.getAllAccountSum.bind(this);

		this.globalUrls = {
			'rates': this.props.urls.host + this.props.urls.sections.getRates,
			'accounts': this.props.urls.host + this.props.urls.sections.getAccounts
		};

		let percentPart;
		let absolutePart;
		let feeSignature;
		if (Object.prototype.toString.call(props.fiatWithdrawFee) === '[object Array]') {
			percentPart = props.fiatWithdrawFee[0];
			if (props.fiatWithdrawFee.length === 2) {
				absolutePart = props.fiatWithdrawFee[1];
			}
		} else {
			percentPart = props.fiatWithdrawFee;
		}

		feeSignature = `${percentPart}%`;
		if (absolutePart) {
			let sign = '+';
			if (absolutePart < 0) {
				sign = '-';
			}
			feeSignature += ` ${sign} ${absolutePart} ${props.currentCurrency}`;
		}

		this.state = {
			withdrawedAmount: null,
			inclusiveFeeToggle: false,
			selectOpened: false,
			isConfirmPopupActive: false,
			isConfirmPopupSuccess: false,
			cardNumberValue: null,
			amountValue: null,
			percentPart: percentPart,
			absolutePart: absolutePart,
			feeSignature: feeSignature,
			allSumAmount: null
		};
	}

	render(){
		let props = this.props,
			currentCard = props.cards.find((card) => card.selected) || {},
			currentCardID = currentCard.id || '';

		let responseStatus = props.responseStatus.find((status) => status.type === 'POST_FIAT_WITHDRAW_RESPONSE') || {},
			cardNumberError = responseStatus.errorArr && responseStatus.errorArr.find((error) => error.field === 'cardNumber') || {},
			amountError = responseStatus.errorArr && responseStatus.errorArr.find((error) => error.field === 'amount') || {},
			allError = responseStatus.errorArr && responseStatus.errorArr.find((error) => error.field === 'all') || {};

		let responseStatusAllSum = props.responseStatus.find(status => status.type === 'GET_FULL_SUM_FIAT_WITHDRAW') || {},
			allSumError = responseStatusAllSum.errorArr && responseStatusAllSum.errorArr.find(error => error.field === 'all') || {};

		let togglerStatus = props.fiatWithdrawFeatures.find((status) => status.type === 'TOGGLE_WITHDRAW'),
			togglerIsID = typeof togglerStatus !== 'undefined' ? togglerStatus.ID : true,
			togglerValue = typeof togglerStatus !== 'undefined' ? props.resourceMgr.get(`cardswitcher.${togglerStatus.value}`, 'info', null, props.userLang, props.defaultLang)
				: props.resourceMgr.get('cardswitcher.new', 'info', null, props.userLang, props.defaultLang);

		let feeMode = !this.state.inclusiveFeeToggle ? 'exclusive' : 'inclusive';

		return (<div className={'b-service--' + props.currentService + '-fiat fiat'}>
				<div className="b-service-submit" ref="fiatWithdrawForm">
					<div className={'b-service-submit-card ' + (togglerIsID && props.cards && !!props.cards.length ? 'select' : 'input')}>
						<div className="row">
							<div className={'form-group col-12 ' + (props.cards && props.cards.length ? 'col-md-6' : 'col-md-12')}>
								{togglerIsID && props.cards && !!props.cards.length && (<ul className={'b-service-cards-list-top b-service-list-top custom-select ' + (responseStatus.error && cardNumberError.message ? 'is-invalid' : '') + ' ' + (this.state.selectOpened ? 'active' : '')} ref="savedCards" data-required="true" onClick={this.toggleSelect} >
										<li className="current">
											<div className="current--wrapper wrapper">
												<div className="current--wrapper-content">
													<div className="current--wrapper-content-info">
														{!currentCardID ? (<React.Fragment>
															<span className="value">{props.resourceMgr.get('cardswitcher.saved', 'info', null, props.userLang, props.defaultLang)}</span>
															</React.Fragment>) : (<React.Fragment>
																	<span className="value">{currentCard.number}</span>
																</React.Fragment>)}
													</div>
													<div className="current--wrapper-content-opener">
														<div className="current--wrapper-content-opener-relative">
														</div>
													</div>
												</div>
												<ul className="b-service-cards-list-bottom b-service-list-bottom">
													{props.cards
														.map((card, i) => {
															let cardKey = (i + card.id).toString('base64');
															return (<li key={cardKey} data-card-id={card.id} className="to-choose cards" onClick={this.changeCardState}>
																	<div className="to-choose--wrapper wrapper">
																		<span className="value">{card.number}</span>
																	</div>
																</li>);
														})}
												</ul>
											</div>
										</li>
									</ul>)}
									{(!togglerIsID || !(props.cards && props.cards.length)) && (<React.Fragment>
											<label htmlFor="withdraw_fiat_cardNumber" className="label cardNumber form-control-label">{props.resourceMgr.get('card.number.label', 'info', null, props.userLang, props.defaultLang)}</label>
											<input ref="cardNumber" id="withdraw_fiat_cardNumber" data-required="true" className={'input cardNumber form-control ' + (responseStatus.error && cardNumberError.message ? 'is-invalid' : '')} type="text" autoComplete="off" />
										</React.Fragment>)}
									{responseStatus.error && cardNumberError.message && (<div className="cardNumber error invalid-feedback">{formatErrorMessage(cardNumberError.message, cardNumberError.field, 'POST_FIAT_WITHDRAW_RESPONSE')}</div>)}
							</div>
							{props.cards && !!props.cards.length && (<div className="form-group col-lg-3 col-12">
									<input type="submit" className="b-service-toggler btn btn-save btn-primary--hover" value={togglerValue} onClick={(evt) => this.toggleWithdrawState(evt, togglerIsID)} />
								</div>)}
						</div>
					</div>
					<div className="b-service-submit-amount">
						<div className="row">
							<div className="form-group col-lg-12">
								<label htmlFor="withdraw_fiat_amount" className="label amount form-control-label">{props.resourceMgr.get('amount.label', 'info', null, props.userLang, props.defaultLang)} ({props.currentCurrency})</label>
								<input ref="amount" onChange={e => this.calculateAmountFee(e, true)} data-regexp="^[0-9]+((\.|,)[0-9]+)?$" data-required="true" data-min-value="isLessThanBalanceFiatWithdraw" data-max-value="isMoreThanBalance"
									id="withdraw_fiat_amount" className={'input amount form-control ' + (responseStatus.error && amountError.message ? 'is-invalid' : '')} type="text" autoComplete="off" />
								{responseStatus.error && amountError.message && (<div className="amount error invalid-feedback float-left">{formatErrorMessage(amountError.message, amountError.field, 'POST_FIAT_WITHDRAW_RESPONSE')}</div>)}
							</div>
						</div>
					</div>
					<div className="b-service-submit-post">
						<div className="row">
							{props.mode && props.mode === 'landing' ? (<div className="col-lg-12"><div className="service-landing-button withdraw_fiat_button float-right"><Link to={props.resourceMgr.get('entranceheader.reference.registration.link', 'info')}>{props.resourceMgr.get('button.make.withdraw', 'info', null, props.userLang, props.defaultLang)}</Link></div></div>)
								: (<div className="col-lg-12">
									<input type="submit" className="withdraw_fiat_button btn btn-save btn-primary--hover float-right" value={props.resourceMgr.get('button.make.withdraw', 'info', null, props.userLang, props.defaultLang)} />
								</div>)}
						</div>
					</div>
				</div>
				{this.renderFiatWithdrawConfirm()}
			</div>);
	}

	getAllAccountSum() {
		this.props.getAllAccountSum(this.props, this);
	}

	toggleSelect() {
		this.setState({
			selectOpened: !this.state.selectOpened
		});
	}

	changeCardState(evt){
		const target = evt.currentTarget;
		const dataset = target.dataset;
		this.props.selectCard(dataset.cardId);
	}

	openFiatWithdrawConfirmPopup() {
		const popup = $(ReactDOM.findDOMNode(this.refs.popupConfirmFiatWithdraw));
		popup.modal('show');

		this.props.refreshResponseStatus();

		this.setState({
			isConfirmPopupActive: true,
			isConfirmPopupSuccess: false
		});
	}

	hideFiatWithdrawConfirmPopup() {
		this.setState({
			isConfirmPopupActive: false,
			isConfirmPopupSuccess: false,
			cardNumberValue: null,
			amountValue: null
		});
	}

	renderFiatWithdrawConfirm() {
		const isActive = this.state.isConfirmPopupActive,
			props = this.props;

		let currentCard = props.cards.find((card) => card.selected) || {};

		let togglerStatus = props.fiatWithdrawFeatures.find((status) => status.type === 'TOGGLE_WITHDRAW'),
			togglerIsID = typeof togglerStatus !== 'undefined' ? togglerStatus.ID : true;

		let responseStatus = props.responseStatus.find((status) => status.type === 'POST_FIAT_WITHDRAW_RESPONSE') || {},
			allError = responseStatus.errorArr && responseStatus.errorArr.find((error) => error.field === 'all') || {},
			successInfo = responseStatus.errorArr && responseStatus.errorArr.find((error) => error.field === 'success') || {};

		const feeSignature = props.fiatWithdrawFee != null ? this.state.feeSignature : props.resourceMgr.get('fee.empty', 'info', null, props.userLang, props.defaultLang);

		return (<div id="popupConfirmFiatWithdraw" tabIndex="-1" role="dialog" aria-labelledby="popupConfirmFiatWithdrawLabel" ref="popupConfirmFiatWithdraw" className={'b-popup b-popup--confirm-fiatwithdraw modal pending ' + (!isActive ? '' : 'show')} >
			<div className="bs-modal_fix">
				<div className="modal-dialog modal-sm bs-modal_fix-helper popupConfirmFiatWithdraw-modal">
					<div className="modal-content popupConfirmFiatWithdraw-content">
						<div className="modal-header popupConfirmFiatWithdraw-header">
							<div className='b-popup-title'>{props.resourceMgr.get('confirm.fiat.withdraw.popup.title', 'info', null, props.userLang, props.defaultLang)}</div>
							<div className='b-popup-close' data-dismiss="modal" aria-label="Close" onClick={this.hideFiatWithdrawConfirmPopup} >X</div>
						</div>
						<div className="modal-body popupConfirmFiatWithdraw-body">
							<div className={'b-popup-submit b-popup-in-progress ' + (this.state.isConfirmPopupSuccess ? 'h-hidden': '')}>
								<div className="b-popup-submit--title">
									<span>{props.resourceMgr.get('confirm.fiat.withdraw.popup.title.submit', 'info', null, props.userLang, props.defaultLang)}</span>
								</div>
								<div className="b-popup-submit--form">
									<div className="b-popup-submit--form-content">
										<div className="general-list-item"><span className='name'>{props.resourceMgr.get('card.number.label', 'info', null, props.userLang, props.defaultLang)}:</span><span className='value'>{this.state.cardNumberValue}</span></div>
										<div className="general-list-item"><span className='name'>{props.resourceMgr.get('amount.label', 'info', null, props.userLang, props.defaultLang)}:</span><span className='value'>{this.state.amountValue} {props.currentCurrency}</span></div>
										<div className="general-list-item"><span className='name'>{props.resourceMgr.get('fiatwithdraw.fee', 'info', null, props.userLang, props.defaultLang)}</span><span className='value'>{feeSignature}</span></div>
									</div>
									<div className="b-popup-submit--form-submit">
										<div className="row">
											<div className="col-lg-12">
												<input type="submit" onClick={this.hideFiatWithdrawConfirmPopup} data-dismiss="modal" aria-label="Close" className="confirm_fiatwithdraw_button_cancel btn btn-save btn-primary--hover float-left" value={props.resourceMgr.get(`button.cancel`, 'info', null, props.userLang, props.defaultLang)} />
												<input type="submit" className="confirm_fiatwithdraw_button_send btn btn-save btn-primary--hover float-right" value={props.resourceMgr.get('button.make.withdraw', 'info', null, props.userLang, props.defaultLang)} />
												{responseStatus.error && allError.message && (<div className="error all invalid-feedback invalid-feedback--general float-right">{formatErrorMessage(allError.message, allError.field, 'POST_FIAT_WITHDRAW_RESPONSE')}</div>)}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className={'b-popup-submit b-popup-success ' + (this.state.isConfirmPopupSuccess ? '': 'h-hidden')}>
								<div className="b-popup-text-wrapper">
									{!responseStatus.error && successInfo.message && (<div className="b-popup-text-text">
											<div className="row">
												<div className="col-md-12 col-12">
													<span className="b-popup-text-text-placeholder">{formatErrorMessage(successInfo.message, successInfo.field, 'POST_FIAT_WITHDRAW_RESPONSE')}</span>
												</div>
											</div>
										</div>)}
									<div className="b-popup-text-button">
										<div className="row">
											<div className="col-md-12 col-12">
												<input type="submit" data-dismiss="modal" aria-label="Close" className="b-popup-text-button-placeholder btn btn-save btn-primary--hover float-right" value={props.resourceMgr.get(`general.popup.title.button.pending`, 'info', null, props.userLang, props.defaultLang)} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>);
	}

	toggleWithdrawState(evt, isID){
		isID = !isID;
		this.props.toggleWithdraw(isID);
	}

	setTypeLimit(evt) {
		let source = evt.target;
		let character = String.fromCharCode(evt.charCode);
		if (character === ',') {
			character = '.';
		}

		let currency = this.props.currentCurrency;
		let value = source.value;

		let newValue = value + character;
		newValue = newValue.replace(/,/, '.');
		const digitLimit = this.props.serviceResources
			&& this.props.serviceResources.exchange[currency];
	}

	toggleInclusiveFee() {
		const inclusiveMode = !this.state.inclusiveFeeToggle;
		this.setState({
			inclusiveFeeToggle: inclusiveMode
		});

		const source = ReactDOM.findDOMNode(this.refs.amount);
		let calculatedAmount;
		if (inclusiveMode) {
			let amount = source.value;
			amount = parseFloat(amount.replace(/,/, '.'), 10);
			calculatedAmount = (amount + (this.state.absolutePart ? this.state.absolutePart : 0)) / (1 - (this.state.percentPart / 100));
		} else {
			calculatedAmount = this.state.withdrawedAmount;
		}

		source.value = calculatedAmount;
		this.calculateAmountFee(calculatedAmount);
	}

	calculateAmountFee(evt, evtRegime) {
		let amount = evtRegime ? evt.target.value : (evt ? evt : ReactDOM.findDOMNode(this.refs.amount).value);
		if (!(!evtRegime && evt)) {
			amount = parseFloat(amount.replace(/,/, '.'), 10);
		}

		if (!isNaN(amount) && amount !== 0 && this.props.fiatWithdrawFee != null) {
			let amountWithoutFee = amount - (amount * (this.state.percentPart / 100));
			if (this.state.absolutePart) {
				amountWithoutFee += (-1) * this.state.absolutePart;
			}
			this.setState({
				withdrawedAmount: amountWithoutFee
			});
		} else {
			this.setState({
				withdrawedAmount: null
			});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FiatWithdraw);