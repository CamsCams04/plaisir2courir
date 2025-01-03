export class Telephone {
    constructor(num) {
        this.num = this.formatTelephone(num);
    }

    formatTelephone(num) {
        let cleanedNum = num.replace(/\D/g, '');
        if (cleanedNum.length === 10) {
            return cleanedNum;
        }else{
            return "0000000000";
        }
    }

    formatWithDashes() {
        if (this.num){
            return this.num.replace(/(\d{2})(?=\d)/g, "$1-");
        }
        else{
            return "";
        }
    }

    getTelephone(){
        return this.num;
    }
}
