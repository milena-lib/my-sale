package com.pdac.caspit.utils;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;

import java.util.Calendar;


public class GeneralData {
	int buissnesstypeindex = 0;
	int categorygroupnumber = 1;
	int langIndex=1;
	long reportNumber=1;
	int splitNumber=0;
	int paymentType = 0;
	String terminalnumber = "";
	String buissnessNumber="";
	String employname="מנהל";
	String upperGlyphText = "";
	String lowerGlyphText = "";
	String exchangeGlyphText = "";
	String backupIP = "82.80.50.36/R&W";
	String ShvaIP = "193.142.151.154:443";
	String CodeIP = "212.68.132.27:15801";
	String TechIP = "212.68.132.27:1123";
	
	boolean printReceipt;
	boolean showReportBy;
	boolean showReportTo;

	int mDocTypeInt;
	float	   	cashInReg = 0;
	float	  	totalCashDeals = 0;
	float	  	totalCheckDeals = 0;
	float	  	totalCreditDeals = 0;
	float	   	totalDiscountDeals = 0;
	float	   	totalMoney		   = -1;
	long		fakeID = 1;
	boolean		ranWizard=false;
	String 		ftpPasswrod = "12345";
	String 		ftpDevPasswrod = "PowControl2016";
	String 		ftpDevUsername = "Pituach";
	int			payment_number = 0;

	private String getMac()
	{
		WifiManager manager = (WifiManager) Global.self.getSystemService(Context.WIFI_SERVICE);
		WifiInfo info = manager.getConnectionInfo();
		String address = info.getMacAddress();
		return address;
	}
	/*private String getAPN()
	{
		//path to APN table
		final Uri APN_TABLE_URI = Uri.parse("content://telephony/carriers");

		//path to preffered APNs
		final Uri PREFERRED_APN_URI = Uri.parse("content://telephony/carriers/preferapn");

		//receiving cursor to preffered APN table
		Cursor c = Global.self.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);

		//moving the cursor to beggining of the table
		c.moveToFirst();

		//now the cursor points to the first preffered APN and we can get some
		//information about it
		//for example first preffered APN id    
		int index = c.getColumnIndex("_id");    //getting index of required column
		Short id = c.getShort(index);           //getting APN's id from

		//we can get APN name by the same way
		index = c.getColumnIndex("name");
		String name = c.getString(index); 

		//and any other APN properties: numeric, mcc, mnc, apn, user, server,
		//password, proxy, port, mmsproxy, mmsport, mmsc, type, current
		return name;
	}*/


	public String getIP(String fullIP)
	{
		String[] parts = fullIP.split(":");
		if (parts.length>1)
			return parts[0];
		else
			return fullIP;
	}
	public String getPort(String fullIP)
	{
		String[] parts = fullIP.split(":");
		if (parts.length>1)
			return parts[1];
		else
			return fullIP;
	}
	
		

	public int getPaymentNumber()
	{
		return payment_number;
	}
	public void IncerasePaymentNumber()
	{
		payment_number++;
	}
	public void resetPaymentNumber()
	{
		payment_number=0;
	}

	public short getCode(  ) //ik 02.2011
	{
		short dd;
		short i;

		String tmpBuff="";
		String timeBuff="";
		Calendar now = Calendar.getInstance();
		timeBuff += String.format("%02d",now.get(Calendar.DAY_OF_MONTH));
		timeBuff += String.format("%02d",now.get(Calendar.MONTH)+1);
		timeBuff += String.format("%04d",now.get(Calendar.YEAR));

		dd = (short)now.get(Calendar.DAY_OF_MONTH);
		dd = sumDigits( dd );


		tmpBuff += ""+dd;//('0' + dd);
		tmpBuff += getTerminalNumber();

		char [] timeBuffCharArray = timeBuff.toCharArray();
		char [] tmpBuffCharArray = tmpBuff.toCharArray();
		for( i = 0; i < 8; i++ ) {
			dd = (short)(timeBuffCharArray[i] + tmpBuffCharArray[i] - '0' - '0');
			dd = sumDigits( dd );

			tmpBuffCharArray[i] = (char)dd;// + '0';

			timeBuffCharArray[i] = (char)(dd + '0'); //debug only
		}

		dd = (short)(timeBuffCharArray[3] + timeBuffCharArray[4] - '0' - '0');
		dd = sumDigits( dd );
		i = dd;

		dd =  (short)(timeBuffCharArray[2] + timeBuffCharArray[5] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 10;

		dd = (short)(timeBuffCharArray[1] + timeBuffCharArray[6] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 100;

		dd = (short)(timeBuffCharArray[0] + timeBuffCharArray[7] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 1000;

	    return i;
	}

	public short getCode(String terminalnumber) //ik 02.2011
	{
		short dd;
		short i;

		String tmpBuff="";
		String timeBuff="";
		Calendar now = Calendar.getInstance();
		timeBuff += String.format("%02d",now.get(Calendar.DAY_OF_MONTH));
		timeBuff += String.format("%02d",now.get(Calendar.MONTH)+1);
		timeBuff += String.format("%04d",now.get(Calendar.YEAR));

		dd = (short)now.get(Calendar.DAY_OF_MONTH);
		dd = sumDigits( dd );


		tmpBuff += ""+dd;//('0' + dd);
		tmpBuff += terminalnumber;

		char [] timeBuffCharArray = timeBuff.toCharArray();
		char [] tmpBuffCharArray = tmpBuff.toCharArray();
		for( i = 0; i < 8; i++ ) {
			dd = (short)(timeBuffCharArray[i] + tmpBuffCharArray[i] - '0' - '0');
			dd = sumDigits( dd );

			tmpBuffCharArray[i] = (char)dd;// + '0';

			timeBuffCharArray[i] = (char)(dd + '0'); //debug only
		}

		dd = (short)(timeBuffCharArray[3] + timeBuffCharArray[4] - '0' - '0');
		dd = sumDigits( dd );
		i = dd;

		dd =  (short)(timeBuffCharArray[2] + timeBuffCharArray[5] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 10;

		dd = (short)(timeBuffCharArray[1] + timeBuffCharArray[6] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 100;

		dd = (short)(timeBuffCharArray[0] + timeBuffCharArray[7] - '0' - '0');
		dd = sumDigits( dd );
		i += dd * 1000;

		return i;
	}

	/*****************************************************************************/
	/*****************************************************************************/
	short sumDigits( short number )
	{
		short tmp = number;
		short sum = 0;

		while( tmp>0 ) {
			sum += tmp % 10;
			tmp /= 10;
		}

		if( sum > 9 )
			sum = sumDigits( sum );

		return sum;
	}

	public String getFtpDevUsername() {
		return ftpDevUsername;
	}
	public String getFtpDevPasswrod() {
		return ftpDevPasswrod;
	}


	public String getFtpPasswrod() {
		return ftpPasswrod;
	}

	private void GenerateFtpPassword(String userID)
	{
		if (userID==null||userID.length()<5){
			setFtpPasswrod("1234");
			return;
		}
		String pass1 = userID.substring(0,2) + userID.substring(3,5) + userID.substring(6,7);
		String pass2 = pass1.substring(2,3) + pass1.substring(3,4) + pass1.substring(0,2) + pass1.substring(4,5);
		
		int sum = 0;
		for (int i=0;i<pass2.length();i++)
		{
			sum += Integer.parseInt(pass2.substring(i,i+1));
		}
		String pass3 = String.valueOf(Integer.parseInt(pass2) + sum);
		StringBuilder reverser = new StringBuilder(pass3);
		String pass = reverser.reverse().toString();
		setFtpPasswrod(pass);
		Log.d("gendata", "ftp pass "+ pass );
	}
	
	public void setFtpPasswrod(String ftpPasswrod) {
		this.ftpPasswrod = ftpPasswrod;
		Settings.StoreStringValue(ftpPasswrodKey, ftpPasswrod);
	}
	public boolean getRanWizard()
	{
		return ranWizard;
	}
	public void setRanWizard(boolean RanWizard)
	{
		ranWizard = RanWizard;
		Settings.StoreBooleanValue(ranWizardKey, RanWizard);
	}
	public long getFakeID()
	{
		return fakeID++;
	}

	public String getDocType() {
		return paymentFormTypeOptions[mDocTypeInt];
	}


	public static String MailHourKey1	 	= "MailHourKey1";
	public static String MailHourKey2 	 	= "MailHourKey2";
	public static String SMSHourKey1 	 	= "SMSHourKey1";
	public static String SMSHourKey2 	 	= "SMSHourKey2";
	public static String useCommissionsKey 	= "useCommissions";
	public static String UpperGlyphTextKey 	= "UpperGlyphText";
	public static String ExchangeGlyphTextKey 	= "ExchangeGlyphText";
	public static String LowerGlyphTextKey 	= "LowerGlyphText";
	public static String printcpoyKey		= "printcpoy";
	public static String wiegthConnectedKey	= "wiegthConnected";
	public static String managerCardRequiredKey	= "managerCardRequiredKey";
	public static String ShowBarcodeKey		= "ShowBarcode";
	public static String SplitNumberKey		= "SplitNumber";
	public static String showLogoKey		= "showLogo";
	public static String cashInRegKey		= "cashInReg";
	public static String showdetialKey		= "showdetial";
	public static String vatAmountKey		= "vatAmount";
	public static String TerminalnumberKey	= "terminalnumber";
	public static String ReportNumberKey	= "reportNumber";
	public static String CancelInvoiceNumberKey	= "cancelInvoiceNumber";
	public static String StartInvoiceNumber	= "startInvoiceNumber";
	public static String StartInvoiceTimeKey	= "StartInvoiceTime";
	public static String CommTypeKey	= "CommType";
	public static String backupIPKey		= "backupIP";
	public static String ShvaIPKey		= "ShvaIP";
	public static String techIPKey		= "techIP";
	public static String codeIPKey		= "codeIP";
	
	public static String ranWizardKey		= "ranWizard";
	public static String docTypeKey			= "docType";
	public static String docTypeIndexKey			= "docTypeIndex";
	public static String ftpPasswrodKey		= "ftpPasswrod";
	public static String buissnessNumberKey = "buissnessNumber";
	public static String buissnessTypeKey = "buissnessType";
	public static String categoryNumberKey = "categoryNumber";
	public static String paymentTypeKey = "paymentType";
	
	public static String printReceiptKey = "printReceiptKey";
	public static String showReportByKey = "showReportByKey";
	public static String showReportToKey = "showReportToKey";
	public static String preferenceKeyForInvoiceNumber = "preferenceKeyForInvoiceNumber";
	
	boolean showbarcode = true; 
	boolean printcpoy	= true;
	boolean useCommissions = true;
	boolean wiegthConnected = true;
	boolean showLogo		= true;
	boolean showdetial		= true;
	boolean managerCardRequired = true;
	float	vatAmount   = -1;
	public String getBackupIP()
	{
		return backupIP;
	}
	public void setBackupIP(String BackupIP)
	{
		backupIP = BackupIP;
		Settings.StoreStringValue(backupIPKey, BackupIP);
	}
	
	public String getShvaIP()
	{
		return ShvaIP;
	}
	public void setShvaIP(String ShvaIP)
	{
		this.ShvaIP = ShvaIP;
		Settings.StoreStringValue(ShvaIPKey, ShvaIP);
	}
	
	public String getTechIP()
	{
		return TechIP;
	}
	public void setTechIP(String TechIP)
	{
		this.TechIP = TechIP;
		Settings.StoreStringValue(techIPKey, TechIP);
	}
	
	public String getCodeIP()
	{
		return CodeIP;
	}
	public void setCodeIP(String CodeIP)
	{
		this.CodeIP = CodeIP;
		Settings.StoreStringValue(codeIPKey, CodeIP);
	}
	
	
	
	public float getCashInReg()
	{
		return cashInReg;
	}

	public int getSplitNumber()
	{
		return splitNumber;
	}
	public void incSplitNumber()
	{
		splitNumber++;
		Settings.StoreIntValue(SplitNumberKey, (int)splitNumber);
	}
	public boolean getShowdetial()
	{
		return showdetial;
	}
	public void setShowdetial(boolean Showdetial)
	{
		showdetial = Showdetial;
		Settings.StoreBooleanValue(showdetialKey, Showdetial);
	}




	String [] paymentFormTypeOptions;
	String [] paymentTypeOptions;
	String [] buissnesTypeOptions;
	String [] yesNoOpt;
	String [] categorynumberOptions;
	String [] LangDisplayOpt;
	String [] CommDisplayOpt;
	int		  CommType;
	String [] HoursOpt;
	String [] LangResOpt = {"en","iw"};
	String date = "";
	String time = "";
	long   invoiceNumber = 1;	
	long   cancel_invoiceNumber = 1;
	long   start_invoiceNumber = 0;
	long   start_invoicetime = 1;
	int	   mailHour2,mailHour1,smsHour1,smsHour2;
	public int	   getLangIndex()
	{
		return langIndex;
	}
	public void setLangIndex(int LangIndex)
	{
		langIndex = LangIndex;
	}
	public boolean getWiegthConnected()
	{
		return wiegthConnected;
	}
	
	public boolean getShowLogo()
	{
		return showLogo;
	}
	public void setShowLogo(boolean ShowLogo)
	{
		showLogo = ShowLogo;
		Settings.StoreBooleanValue(showLogoKey, ShowLogo);
	}
	public void setwiegthConnected(boolean WiegthConnected)
	{
		wiegthConnected = WiegthConnected;
		Settings.StoreBooleanValue(wiegthConnectedKey, WiegthConnected);
	}

	public void setManagerCardRequired(boolean managerCardRequired)
	{
		this.managerCardRequired = managerCardRequired;
		Settings.StoreBooleanValue(wiegthConnectedKey, managerCardRequired);
	}

	public boolean getManagerCardRequired() {
		return managerCardRequired;
	}

	public String[] getPaymentFormTypeOptions()
	{
		return paymentFormTypeOptions;
	}
	public String[] getPaymentypeOptions()
	{
		return paymentTypeOptions;
	}

	public int getPaymentType()
	{
		return paymentType;
	}
	public boolean getUseCommissions()
	{
		return useCommissions;
	}
	public void setUseCommissions(boolean UseCommissions)
	{
		useCommissions = UseCommissions;
		Settings.StoreBooleanValue(useCommissionsKey, UseCommissions);
	}
	
	public void   setHourMail1(int hourMail)
	{
		mailHour1 = hourMail;
		Settings.StoreIntValue(MailHourKey1, hourMail);
	}
	
	public String   getHoutMail1()
	{
		return HoursOpt[mailHour1];
	}
	
	public void   setHourMail2(int hourMail)
	{
		mailHour2 = hourMail;
		Settings.StoreIntValue(MailHourKey2, hourMail);
	}
	
	public String   getHoutMail2()
	{
		return HoursOpt[mailHour2];
	}
	
	public void   setSMSMail1(int hourSMS)
	{
		smsHour1 = hourSMS;
		Settings.StoreIntValue(SMSHourKey1, smsHour1);
	}
	
	public String   getSMSMail1()
	{
		return HoursOpt[smsHour1];
	}
	
	public void   setSMSMail2(int hourSMS)
	{
		smsHour1 = hourSMS;
		Settings.StoreIntValue(SMSHourKey2, hourSMS);
	}
	
	public String   getSMSMail2()
	{
		return HoursOpt[mailHour2];
	}
	public void setcCommType(int commType)
	{
		CommType = commType;
		Settings.StoreIntValue(CommTypeKey, commType);
	}
	public int getCommType()
	{
		return CommType;
	}
	public String[] getCommOpt()
	{
		return CommDisplayOpt;
	}
	public String[] getHourOpt()
	{
		return HoursOpt;
	}
	public void setStartInvoiceTimeStamp(long time)
	{
		start_invoicetime = time;
		Settings.StorelongValue(StartInvoiceTimeKey, time);
		//setStartInvoiceTimeStamp(time);
	}
	public long getStartInvoiceTimeStamp()
	{
		return start_invoicetime;
		
	}
	public long getStartInvoiceNumber()
	{
		return start_invoiceNumber;
	}
	public void setStartInvoiceNumber(int number)
	{
		setStartInvoiceTimeStamp(System.currentTimeMillis());
		Settings.StoreIntValue(StartInvoiceNumber, number);
		start_invoiceNumber= number;
	}
	public long getReportNumber()
	{
		return reportNumber;
	}
	public void setReportNumber(long reportNumber)
	{
		this.reportNumber = reportNumber;
		Settings.StorelongValue(ReportNumberKey, reportNumber);
	}
	public long getCancel_invoiceNumber()
	{
		Log.d("AAA","cancel_invoiceNumber = " + cancel_invoiceNumber);
		return cancel_invoiceNumber;
	}
	public void setCancel_invoiceNumber(long Cancel_invoiceNumber)
	{
		Log.d("AAA","cancel_invoiceNumber = " + cancel_invoiceNumber);
		cancel_invoiceNumber = Cancel_invoiceNumber;
		Settings.StorelongValue(CancelInvoiceNumberKey, Cancel_invoiceNumber);
	}
	public void setInvoiceNumber(long number) {
		invoiceNumber = number;
		Settings.StorelongValue(preferenceKeyForInvoiceNumber, number);
		
	}
	
	public boolean getPrintcpoy() {
		return printcpoy;
	}
	public void setPrintcpoy(boolean printcpoy) {
		this.printcpoy = printcpoy;
		Settings.StoreBooleanValue(printcpoyKey, printcpoy);
	}
	public float getVatAmount() {
		return vatAmount;
	}
	public void setVatAmount(float vatAmount) {
		this.vatAmount = vatAmount;
		Settings.StoreFloatValue(vatAmountKey, vatAmount);
	}
	public long getInvoiceNumber()
	{
		return invoiceNumber;
	}
	public void setDate(String date)
	{
		this.date = date;
	}
	public String getDate()
	{
		return date;
	}
	public void setTime(String time)
	{
		this.time = time;
	}
	public String getTime()
	{
		return time;
	}
	public void setUpperGlyphText(String glyphText)
	{
		upperGlyphText = glyphText;
		Settings.StoreStringValue(UpperGlyphTextKey, upperGlyphText);
	}
	public String getUpperGlyphText()
	{
		return upperGlyphText;
	}
	public void setLowerGlyphText(String glyphText)
	{
		lowerGlyphText = glyphText;
		Settings.StoreStringValue(LowerGlyphTextKey, lowerGlyphText);
		
	}
	public void setExchangeGlyphText(String glyphText)
	{
		exchangeGlyphText = glyphText;
		Settings.StoreStringValue(ExchangeGlyphTextKey, glyphText);
	}
	public String getExchangeGlyphText()
	{
		return exchangeGlyphText;
	}
	public String getLowerGlyphText()
	{
		return lowerGlyphText;
	}
	public void setBuissnessTypeIndex(int index)
	{
		buissnesstypeindex = index;
		Settings.StoreIntValue(buissnessTypeKey, index);
	}
	public int getBuissnessTypeIndex()
	{
		return buissnesstypeindex == -1 ? 0 : buissnesstypeindex;
	}
	public void setEmployName(String name)
	{
		Settings.StoreStringValue(Constants.PREF_KASSIER, name);
	}


	public void setEmployeeId(int id) {
		Settings.StoreIntValue(Constants.PREF_KASSIER_ID, id);
	}
	public long getEmployeeId() {
		return Settings.GetIntValue(Constants.PREF_KASSIER_ID, 0);
	}

	public void setBuissnessNumber(String number)
	{
		buissnessNumber = number;
		Settings.StoreStringValue(buissnessNumberKey, number);
	}
	public String getBuissnessNumber()
	{
		return buissnessNumber;
	}
	public void setTerminalNumber(String number)
	{
		Settings.StoreStringValue(TerminalnumberKey, number);
		terminalnumber = number;
		GenerateFtpPassword(terminalnumber);
	}
	public String getTerminalNumber()
	{
		return terminalnumber;
	}
	public void    setShowBarcode(boolean barcode)
	{
		Settings.StoreBooleanValue(ShowBarcodeKey, barcode);
		showbarcode = barcode;
	}
	public boolean getShowBarcode()
	{
		return showbarcode;
	}
	public void    setCategoryNumber(int number)
	{
		categorygroupnumber = number;
		Settings.StoreIntValue(categoryNumberKey, number);
	}
	public int getCategoryNumber()
	{
		return categorygroupnumber;
	}
	
	
	public void  setPrintReceipt(boolean print)
	{
		printReceipt= print;
		Settings.StoreBooleanValue(printReceiptKey, print);
	}
	public boolean getPrintReceipt()
	{
		return printReceipt;
	}
	
	
	public void  setShowReportTo(boolean show)
	{
		showReportTo= show;
		Settings.StoreBooleanValue(showReportToKey,show);
	}
	public boolean getShowReportTo()
	{
		return showReportTo;
	}
	
	
	public void  setShowReportBy(boolean show)
	{
		showReportBy = show;
		Settings.StoreBooleanValue(showReportByKey, show);
	}
	public boolean getShowReportBy()
	{
		return showReportBy;
	}
	
	
	
	public String[] getbuissnesTypeOptions()
	{
		return buissnesTypeOptions;
	}

	public String[] getcategorynumberOptions()
	{
		return categorynumberOptions;
	}
	public String[] getLangDisplayOpt()
	{
		return LangDisplayOpt;
	}
	public String[] getLangResOpt()
	{
		return LangResOpt;
	}

	public int getDocTypeIndex() {
		return mDocTypeInt;
	}
}