import { defineStore } from 'pinia'
import { LocationResponse, QueryResponse, locationResponseMapper, queryResponseMapper } from './helpers';

export type MapsState = {
    addressSearchQuery: string;
    placeId: string;
    isLoading: boolean;
    autoSearch: boolean;
    selections: Option[],
    addressForm: AddressForm;
    errorMessage: string;
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
        errorMessage: ""
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
                const response = await fetch(`/api/address/${query}`);
                const data = await response.json() as QueryResponse;
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
            // TODO check if request is cancelled

            console.log(error);
            
            this.isLoading = false;
            this.errorMessage = "something"
        },
        async selectLocation(selection: Option) {
            this.isLoading = true;
            this.placeId = selection.value
            this.errorMessage = "";

            try {
                const response = await fetch(`/api/${this.placeId}`);
                const data = await response.json() as LocationResponse;
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
            // TODO check if request is cancelled

            console.log(error);
            
            this.isLoading = false;
            this.errorMessage = "something"
        },
        onUpdateAddressForm(data: AddressForm) {
            // this.addressForm = {
            //     ...this.addressForm,
            //     streetAddress: data.streetAddress,
            //     city: data.city,
            //     postcode: data.postcode
            // }

            this.autoSearchAndSelect(data)
        },
        async autoSearchAndSelect(data: AddressForm) {
            this.isLoading = true;
            this.errorMessage = "";

            const query = `${data.streetAddress} ${data.city} ${data.postcode} ${data.state}`

            let option: Option | null = null

            try {
                const response = await fetch(`/api/address/${query}`);
                const data = await response.json() as QueryResponse;
                option = queryResponseMapper(data)[0]

            } catch (error) {
                console.log(error); // TODO create an action
            }

            if (!option) {
                return
            }

            try {
                const response = await fetch(`/api/${option.value}`);
                const data = await response.json() as LocationResponse;
                this.autoSearchAndSelectSuccess(locationResponseMapper(data))
            } catch (error) {
                console.log(error); // TODO create an action
            }
        },
        autoSearchAndSelectSuccess(data: AddressForm) {
            this.isLoading = false;
            this.addressForm = data;
        },
        updateLangLong(data: {lang: string; long:string}) {
            this.addressForm.lang = data.lang;
            this.addressForm.long = data.long;
        }
    }
})
