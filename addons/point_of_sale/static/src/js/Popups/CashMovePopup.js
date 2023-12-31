odoo.define('point_of_sale.CashMovePopup', function (require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const { _lt } = require('@web/core/l10n/translation');
    const { parse } = require('web.field_utils');
    const { useValidateCashInput } = require('point_of_sale.custom_hooks');

    const { useRef, useState } = owl;

    class CashMovePopup extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            this.state = useState({
                inputType: '', // '' | 'in' | 'out'
                inputAmount: '',
                inputReason: '',
                inputHasError: false,
                parsedAmount: 0,
            });
            this.inputAmountRef = useRef('input-amount-ref');
            useValidateCashInput('input-amount-ref');
        }
        confirm() {
            try {
                parse.float(this.state.inputAmount);
            } catch (_error) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t('Invalid amount');
                return;
            }
            if (this.state.inputType == '') {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t('Select either Cash In or Cash Out before confirming.');
                return;
            }
            if (this.state.inputType === 'out' && this.state.inputAmount > 0) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t('Insert a negative amount with the Cash Out option.');
                return;
            }
            if (this.state.inputType === 'in' && this.state.inputAmount < 0) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t('Insert a positive amount with the Cash In option.');
                return;
            }
            if (parse.float(this.state.inputAmount) < 0) {
                this.state.inputAmount = this.state.inputAmount.substring(1);
            }
            return super.confirm();
        }
        _onAmountKeypress(event) {
            if (event.key === '-') {
                event.preventDefault();
                this.state.inputAmount = this.state.inputType === 'out' ? this.state.inputAmount.substring(1) : `-${this.state.inputAmount}`;
                this.state.inputType = this.state.inputType === 'out' ? 'in' : 'out';
                this.handleInputChange();
            }
        }
        onClickButton(type) {
            let amount = this.state.inputAmount;
            if (type === 'in') {
                this.state.inputAmount = amount.charAt(0) === '-' ? amount.substring(1) : amount;
            } else {
                this.state.inputAmount = amount.charAt(0) === '-' ? amount : `-${amount}`;
            }
            this.state.inputType = type;
            this.state.inputHasError = false;
            this.inputAmountRef.el && this.inputAmountRef.el.focus();
            this.handleInputChange();
        }
        getPayload() {
            return {
                amount: parse.float(this.state.inputAmount),
                reason: this.state.inputReason.trim(),
                type: this.state.inputType,
            };
        }
        handleInputChange() {
            if (this.inputAmountRef.el.classList.contains('invalid-cash-input')) return;
            this.state.parsedAmount = parse.float(this.state.inputAmount);
        }
    }
    CashMovePopup.template = 'point_of_sale.CashMovePopup';
    CashMovePopup.defaultProps = {
        cancelText: _lt('Cancel'),
        title: _lt('Cash In/Out'),
    };

    Registries.Component.add(CashMovePopup);

    return CashMovePopup;
});
