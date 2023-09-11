import { defineStore } from 'pinia'
import { LocationResponse, QueryResponse, isFormEmpty, locationResponseMapper, queryResponseMapper } from './helpers';
import fetchData, { getErrorMessage, isRequestAbortError } from '../utils/http';

export enum ERROR_STATE {
    EMPTY_FORM = "EMPTY_FORM",
    EMPTY_PREDICTIONS = "EMPTY_PREDICTIONS"
}

export enum REGISTRATION_STEP {
    FILLING_ADDRESS_FORM = "FILLING_ADDRESS_FORM",
    VALIDATE_ADDRESS = "VALIDATE_ADDRESS"
}

export type MapsState = {
    addressSearchQuery: string;
    placeId: string;
    isLoading: boolean;
    autoSearch: boolean;
    selections: Option[],
    addressForm: AddressForm;
    errorMessage: string;
    errorState: ERROR_STATE | null;
    registrationStep: REGISTRATION_STEP;
}

export type AddressForm = {
    streetAddress: string;
    state: string; // ? περιφέρεια
    city: string;
    postcode: string;
    floor: string;
    long: string;
    lang: string;
}

export type Option = {
    name: string;
    value: string;
}

export const useMapsStore = defineStore('maps', {
    state: () :MapsState => ({
        addressSearchQuery: "",
        placeId: "",
        isLoading: false,
        autoSearch: true,
        selections: [],
        addressForm: {
            streetAddress: "",
            state: "",
            city: "",
            postcode: "",
            floor: "",
            long: "",
            lang: "",
        },
        errorMessage: "",
        errorState: null,
        registrationStep: REGISTRATION_STEP.FILLING_ADDRESS_FORM
    }),
    actions: {
        resetAddressForm() {
            this.addressForm = {
                streetAddress: "",
                state: "",
                city: "",
                postcode: "",
                floor: "",
                long: "",
                lang: "",
            }
        },
        async searchWithQuery(query: string) {
            if (!query || query.length < 3) {
                return
            }

            this.isLoading = true;
            this.selections = [];
            this.errorMessage = "";
            this.resetAddressForm();

            try {
                const data = await fetchData(`/api/address/${query}`, undefined, 'initial_query') as QueryResponse;
                this.searchWithQuerySuccess(queryResponseMapper(data))
            } catch (error) {
                this.searchWithQueryFail(error)
            }
        },
        searchWithQuerySuccess(options: Option[]) {
            this.isLoading = false;
            this.selections = options;
        },
        searchWithQueryFail(error: any) {
            if (isRequestAbortError(error)) {
                return
            }
            
            this.isLoading = false;
            this.errorMessage = getErrorMessage(error)
        },
        async selectLocation(selection: Option) {
            this.isLoading = true;
            this.placeId = selection.value
            this.errorMessage = "";

            try {
                const data = await fetchData(`/api/${this.placeId}`, undefined, 'select_location') as LocationResponse;
                this.selectLocationSuccess(locationResponseMapper(data))
            } catch (error) {
                this.selectLocationFail(error)
            }
        },
        selectLocationSuccess(data: AddressForm) {
            this.isLoading = false;
            this.addressForm = data
        },
        selectLocationFail(error: any) {
            if (isRequestAbortError(error)) {
                return
            }
            
            this.isLoading = false;
            this.errorMessage = getErrorMessage(error)
        },
        onUpdateAddressForm(data: AddressForm, autoUpdate=true) {
            this.addressForm = data;
            autoUpdate && this.autoUpdateLangLong(data);
        },
        async autoUpdateLangLong(data: AddressForm) {
            this.isLoading = true;
            this.errorMessage = "";

            const query = `${data.streetAddress} ${data.city} ${data.postcode} ${data.state}`

            let option: Option | null = null

            try {
                const data = await fetchData(`/api/address/${query}`, undefined, 'options_for_auto_lang_long') as QueryResponse;
                option = queryResponseMapper(data)[0]

            } catch (error) {
                if (isRequestAbortError(error)) {
                    return
                }
            }

            if (!option) {
                return
            }

            try {
                const data = await fetchData(`/api/${option.value}`, undefined, 'auto_lang_long') as LocationResponse;
                this.autoUpdateLangLongSuccess(locationResponseMapper(data))
            } catch (error) {
                this.autoUpdateLangLongFail(error)
            }
        },
        autoUpdateLangLongSuccess({lang,long}: {lang:string;long:string}) {
            this.isLoading = false;

            this.addressForm.lang = lang
            this.addressForm.long = long
        },
        autoUpdateLangLongFail(error: any) {
            if (isRequestAbortError(error)) {
                return
            }
            
            this.isLoading = false;
            this.errorMessage = getErrorMessage(error)
        },
        userUpdateLangLong({lat,lng}: {lat:number; lng: number}) {
            this.addressForm.lang = lat.toString();
            this.addressForm.long = lng.toString();
        },
        async userFormSubmit() {
            this.errorState = null;

            // ? validate if form is empty
            if (isFormEmpty(this.addressForm)) {
                this.errorState = ERROR_STATE.EMPTY_FORM
                return
            }

            // ? validate form with google for errors
            const query = `${this.addressForm.streetAddress} ${this.addressForm.city} ${this.addressForm.postcode} ${this.addressForm.state}`

            let option: Option | null = null

            try {
                const data = await fetchData(`/api/address/${query}`, undefined, 'address_form_submit') as QueryResponse;
                option = queryResponseMapper(data)[0]
            } catch (error) {
                if (isRequestAbortError(error)) {
                    return
                }
            }

            if (!option) {
                this.errorState = ERROR_STATE.EMPTY_PREDICTIONS
                return
            }

            this.registrationStep = REGISTRATION_STEP.VALIDATE_ADDRESS
        }
    },
    getters: {
        showMapView(): boolean {
            return !!(this.addressForm.lang && this.addressForm.long);
        },
        getAddressLangLong(): number[] {
            return [+this.addressForm.lang, +this.addressForm.long];
        }
    }
})
