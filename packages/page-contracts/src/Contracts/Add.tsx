// Copyright 2017-2020 @polkadot/app-contracts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/react-api/types';
import { I18nProps } from '@polkadot/react-components/types';
import { ActionStatus } from '@polkadot/react-components/Status/types';

import React from 'react';
import { withApi } from '@polkadot/react-api/hoc';
import { AddressRow, Button, Input } from '@polkadot/react-components';
import keyring from '@polkadot/ui-keyring';

import ContractModal, { ContractModalProps, ContractModalState } from '../Modal';
import ValidateAddr from './ValidateAddr';

import translate from '../translate';

interface Props extends ContractModalProps, ApiProps, I18nProps {}

interface State extends ContractModalState {
  address?: string | null;
  isAddressValid: boolean;
}

class Add extends ContractModal<Props, State> {
  constructor (props: Props) {
    super(props);
    this.defaultState = {
      ...this.defaultState,
      address: null,
      isAddressValid: false,
      isNameValid: true,
      name: 'New Contract'
    };
    this.state = this.defaultState;
    this.headerText = props.t('Add an existing contract');
  }

  public isContract = true;

  protected renderContent = (): React.ReactNode => {
    const { t } = this.props;
    const { address, isAddressValid, isBusy, name } = this.state;

    return (
      <AddressRow
        defaultName={name}
        isValid
        value={address || null}
      >
        <Input
          autoFocus
          help={t<string>('The address for the deployed contract instance.')}
          isDisabled={isBusy}
          isError={!isAddressValid}
          label={t<string>('contract address')}
          onChange={this.onChangeAddress}
          onEnter={this.submit}
          value={address || ''}
        />
        <ValidateAddr
          address={address}
          onChange={this.onValidateAddr}
        />
        {this.renderInputName()}
        {this.renderInputAbi()}
      </AddressRow>
    );
  }

  protected renderButtons = (): React.ReactNode => {
    const { t } = this.props;
    const { isAbiValid, isAddressValid, isNameValid } = this.state;
    const isValid = isNameValid && isAddressValid && isAbiValid;

    return (
      <Button
        icon='save'
        isDisabled={!isValid}
        isPrimary
        label={t<string>('Save')}
        onClick={this.onAdd}
      />
    );
  }

  private onChangeAddress = (address: string): void => {
    this.setState({ address, isAddressValid: false });
  }

  private onValidateAddr = (isAddressValid: boolean): void => {
    this.setState({ isAddressValid });
  }

  private onAdd = (): void => {
    const { api } = this.props;
    const status: Partial<ActionStatus> = { action: 'create' };
    const { abi, address, name, tags } = this.state;

    if (!address || !abi || !name) {
      return;
    }

    try {
      const json = {
        contract: {
          abi,
          genesisHash: api.genesisHash.toHex()
        },
        name,
        tags
      };

      keyring.saveContract(address, json);

      status.account = address;
      status.status = address ? 'success' : 'error';
      status.message = 'contract added';

      this.onClose();
    } catch (error) {
      console.error(error);

      status.status = 'error';
      status.message = (error as Error).message;
    }
  }
}

export default translate(withApi(Add));