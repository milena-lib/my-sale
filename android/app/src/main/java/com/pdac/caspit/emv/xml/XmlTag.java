package com.pdac.caspit.emv.xml;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 * All possible xml tags used for pinpad communication
 *
 * @author Alexander Kamenkov
 */

public class XmlTag {

	public static final String OPEN = "<";
	public static final String CLOSE = ">";
	public static final String SLASH = "/";

	public static class Request {
		public final static String Request = "Request";
		public final static String Command = "Command";
		public final static String TerminalId = "TerminalId";
		public final static String RequestId = "RequestId";
		public final static String TermNo = "TermNo";
		public final static String TimeoutInSeconds = "TimeoutInSeconds";
		public final static String SapakMutavNo = "SapakMutavNo";
		public final static String Mti = "Mti";
		public final static String Eci = "Eci";
		public final static String CavvUcaf = "CavvUcaf";
		public final static String Xid = "Xid";
		public final static String CapDpa = "CapDpa";
		public final static String CashbackAmount = "CashbackAmount";
		public final static String Tip = "Tip";
		public final static String IpayCode = "IpayCode";
		public final static String IpayAmount = "IpayAmount";
		public final static String IpayNumber = "IpayNumber";
		public final static String IpayPercent = "IpayPercent";
		public final static String OfferCode = "OfferCode";
		public final static String GiftCode = "GiftCode";
		public final static String ProductCode = "ProductCode";
		public final static String ConversionAmount = "ConversionAmount";
		public final static String ConversionRate = "ConversionRate";
		public final static String ConversionCurrency = "ConversionCurrency";
		public final static String GasolineType = "GasolineType";
		public final static String GasolineLiter = "GasolineLiter";
		public final static String OilLiter = "OilLiter";
		public final static String OilAmount = "OilAmount";
		public final static String Speedometer = "Speedometer";
		public final static String CarNumber = "CarNumber";
		public final static String ServiceAmount = "ServiceAmount";
		public final static String Zip = "Zip";
		public final static String Address = "Address";
		public final static String City = "City";
		public final static String StndOrdrNo = "StndOrdrNo";
		public final static String StndOrdrTotalNo = "StndOrdrTotalNo";
		public final static String StndOrdrTotalSum = "StndOrdrTotalSum";
		public final static String StndOrdrUniqueRef = "StndOrdrUniqueRef";
		public final static String Commission = "Commission";
		public final static String StndOrdrFreq = "StndOrdrFreq";
		public final static String Cellular = "Cellular";
		public final static String CardSeqNumber = "CardSeqNumber";
		public final static String Otp = "Otp";
		public final static String FirstPayment = "FirstPayment";
		public final static String NotFirstPayment = "NotFirstPayment";
		public final static String NoPayments = "NoPayments";
		public final static String IndexPayment = "IndexPayment";
		public final static String OriginalUid = "OriginalUid";
		public final static String OriginalTranDate = "OriginalTranDate";
		public final static String OriginalTranTime = "OriginalTranTime";
		public final static String OriginalAmount = "OriginalAmount";
		public final static String OriginalAuthorizedAmount = "OriginalAuthorizedAmount";
		public final static String OriginalAuthNum = "OriginalAuthNum";
		public final static String OriginalAuthSolekNum = "OriginalAuthSolekNum";
		public final static String OriginalAuthorizationCodeManpik = "OriginalAuthorizationCodeManpik";
		public final static String OriginalAuthorizationCodeSolek = "OriginalAuthorizationCodeSolek";
		public final static String OriginalLinkIncrAuth = "OriginalLinkIncrAuth";
		public final static String ClientInputPan = "ClientInputPan";
		public final static String PanEntryMode = "PanEntryMode";
		public final static String CreditTerms = "CreditTerms";
		public final static String TranType = "TranType";
		public final static String AshReasonCredit = "AshReasonCredit";
		public final static String AuthorizationCodeSolek = "AuthorizationCodeSolek";
		public final static String AuthorizationCodeManpik = "AuthorizationCodeManpik";
		public final static String Addendum1 = "Addendum1";
		public final static String ExpirationDate = "ExpirationDate";
		public final static String Amount = "Amount";
		public final static String AuthorizationNo = "AuthorizationNo";
		public final static String Currency = "Currency";
		public final static String ClubNumber = "ClubNumber";
		public final static String ParameterJ = "ParameterJ";
		public final static String Cvv2 = "Cvv2";
		public final static String Id = "Id";
		public final static String DeferMonths = "DeferMonths";
		public final static String DueDate = "DueDate";
		public final static String Rrn = "Rrn";
		public final static String SpecialProjectCode = "SpecialProjectCode";
		public final static String SpecialProjectInfo1 = "SpecialProjectInfo1";
		public final static String SelfServiceTrans = "SelfServiceTrans";
		public final static String WaitCardRemoval = "WaitCardRemoval";
		public final static String SubCommand = "SubCommand";

	}

	public static class Response {
		public final static String EMV_Output = "EMV_Output";
		public final static String Response = "Response";
		public final static String Command = "Command";
		public final static String TerminalId = "TerminalId";
		public final static String Status = "Status";
		public final static String AshStatus = "AshStatus";
		public final static String AshStatusDes = "AshStatusDes";
		public final static String Pan = "Pan";
		public final static String PanEntryMode = "PanEntryMode";
		public final static String CardName = "CardName";
		public final static String ExpirationDate = "ExpirationDate";
		public final static String Manpik = "Manpik";
		public final static String Brand = "Brand";
		public final static String Solek = "Solek";
		public final static String CardType = "CardType";
		public final static String SpType = "SpType";
		public final static String Amount = "Amount";
		public final static String TranType = "TranType";
		public final static String CreditTerms = "CreditTerms";
		public final static String Currency = "Currency";
		public final static String CurrencyName = "CurrencyName";
		public final static String FileNo = "FileNo";
		public final static String TermNo = "TermNo";
		public final static String TermSeq = "TermSeq";
		public final static String TerminalName = "TerminalName";
		public final static String Retailer = "Retailer";
		public final static String ComRetailerNum = "ComRetailerNum";
		public final static String HostVersion = "HostVersion";
		public final static String DateTime = "DateTime";
		public final static String ResponseId = "ResponseId";
		public final static String ResponseCvv2 = "ResponseCvv2";
		public final static String CavvUcafResult = "CavvUcafResult";
		public final static String ResponseAvs = "ResponseAvs";
		public final static String AuthManpikNo = "AuthManpikNo";
		public final static String AuthCodeManpik = "AuthCodeManpik";
		public final static String AuthSolekNo = "AuthSolekNo";
		public final static String AuthCodeSolek = "AuthCodeSolek";
		public final static String FirstPayment = "FirstPayment";
		public final static String NotFirstPayment = "NotFirstPayment";
		public final static String NoPayment = "NoPayment";
		public final static String Uid = "Uid";
		public final static String Rrn = "Rrn";
		public final static String TelNoCom = "TelNoCom";
		public final static String Deferred = "Deferred";
		public final static String DueDate = "DueDate";
		public final static String Tip = "Tip";
		public final static String IpayAmount = "IpayAmount";
		public final static String IpayNumber = "IpayNumber";
		public final static String IpayPercent = "IpayPercent";
		public final static String Cashback = "Cashback";
		public final static String TVR = "TVR";
		public final static String Addendum1Settl = "Addendum1Settl";
		public final static String Addendum2Settl = "Addendum2Settl";
		public final static String Addendum3Settl = "Addendum3Settl";
		public final static String Addendum4Settl = "Addendum4Settl";
		public final static String Addendum5Settl = "Addendum5Settl";
		public final static String F39Response = "F39Response";
		public final static String IndxPayment = "IndxPayment";
		public final static String PhaseRequest2 = "PhaseRequest2";
		public final static String Authorizedamount = "Authorizedamount";
		public final static String Addendum1 = "Addendum1";
		public final static String Addendum2 = "Addendum2";
		public final static String ParameterJ = "ParameterJ";
		public final static String AddDspBalance = "AddDspBalance";
		public final static String DspBalance = "DspBalance";
		public final static String AddDspF111 = "AddDspF111";
		public final static String ZData = "ZData";
		public final static String Track2 = "Track2";
		public final static String TranRecord = "TranRecord";
		public final static String Atc = "ATC";
		public final static String CardSeqNumber = "CardSeqNumber";
		public final static String AID = "AID";
		public final static String TSI = "TSI";
		public final static String ARC = "ARC";
		public final static String VerifiedByPIN = "VerifiedByPIN";
		public final static String AppVersion = "appVersion";
		public final static String receiptMerchant = "ReceiptMerchant";
		public final static String receiptCustomer = "ReceiptCustomer";
	}
}
