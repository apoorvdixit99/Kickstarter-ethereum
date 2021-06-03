import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class ContributeForm extends Component {

    state = {
        value: '',
        errorMessage: '',
        loading: false
    };

    onSubmit = async event => {

        event.preventDefault();
        
        const campaign = Campaign(this.props.address);

        //Start the spinner and clear the error if any
        this.setState({ loading: true, errorMessage: '' });

        try{
            //Fetch accounts
            const accounts = await web3.eth.getAccounts();
            
            //contribute method
            await campaign.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether')
            });

            //Refresh the page to update the fields
            Router.replaceRoute(`/campaigns/${this.props.address}`);

        } catch (err){
            this.setState({ errorMessage : err.message });
        }

        //Unset the spinner and clear the value
        this.setState({ loading: false, value: ''});

    };

    render () {
        return(
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                    <label>Amount to Contribute</label>
                    <Input 
                        value={this.state.value}
                        onChange={event => this.setState({ value: event.target.value })}
                        label="ether"
                        labelPosition="right"
                    />
                </Form.Field>
                <Message error header="Oops!" content={this.state.errorMessage}/>
                <Button primary loading={this.state.loading}>
                    Contribute!
                </Button>
            </Form>
        );
    };
}

export default ContributeForm;