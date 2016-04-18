/**
 * OnePica
 * NOTICE OF LICENSE
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to codemaster@onepica.com so we can send you a copy immediately.
 *
 * @category  Affirm
 * @package   OnePica_Affirm
 * @copyright Copyright (c) 2016 One Pica, Inc. (http://www.onepica.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
/*browser:true*/
/*global define*/
define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/payment/additional-validators',
        'mage/url',
        'synchPost',
        'Magento_Checkout/js/model/url-builder',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/error-processor',
        'Magento_Ui/js/model/messages',
        'Magento_Checkout/js/action/set-payment-information',
        'OnePica_Affirm/js/action/verify-affirm'
    ],
    function ($, Component, quote, additionalValidators, url,
              storage, urlBuilder, customer, errorProcessor, Messages, setPaymentAction, verifyAffirmAction) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'OnePica_Affirm/payment/form',
                transactionResult: ''
            },

            /**
             * Init Affirm specify message controller
             */
            initAffirm: function() {
                this.messageContainer = new Messages();
            },

            /**
             * Payment code
             *
             * @returns {string}
             */
            getCode: function () {
                return 'affirm_gateway';
            },

            /**
             * Get payment info
             *
             * @returns {info|*|indicators.info|z.info|Wd.$get.info|logLevel.info}
             */
            getInfo: function () {
                return window.checkoutConfig.payment['affirm_gateway'].info
            },

            /**
             * Get affirm logo src from config
             *
             * @returns {*}
             */
            getAffirmLogoSrc: function () {
                return window.checkoutConfig.payment['affirm_gateway'].logoSrc;
            },

            /**
             * Continue to Affirm redirect logic
             */
            continueInAffirm: function() {
                var self = this;
                if (additionalValidators.validate()) {
                    //update payment method information if additional data was changed
                    this.selectPaymentMethod();
                    $.when(setPaymentAction(this.messageContainer, {'method': self.getCode()})).done(function() {
                        $.mage.redirect(window.checkoutConfig.payment['affirm_gateway'].redirectUrl);
                    }).fail(function(){
                        self.isPlaceOrderActionAllowed(true);
                    });
                    return false;
                }
            },

            /**
             * Init payment
             */
            initialize: function () {
                var _self = this;
                this._super();
                $.when(verifyAffirmAction(_self.messageContainer)).done(function(response){
                    if (response) {
                       _self.selectPaymentMethod();
                    }
                }).fail(function(response){
                    errorProcessor.process(response, _self.messageContainer);
                });
            }
        });
    }
);
