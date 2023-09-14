package com.pdac.caspit.emv.core;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 * @author Alexander Kamenkov
 */

class Constant {
	static final String INGENICO_STATE_CHANGED_FILTER = "com.ingenico.pclservice.intent.action.STATE_CHANGED";

	static class Extras {
		static final String PACKAGE_NAME = "PACKAGE_NAME";
		static final String FILE_NAME = "FILE_NAME";
		static final String SSL_OBJECT = "SSL_OBJECT";
		static final String ENABLE_LOG = "ENABLE_LOG";
	}

	static class SSL {
		static final String P12_SERVER_B = "serverb.p12";
		static final String COUCOU = "coucou";
	}

	static class Params {
		static final String PAIRING_FILE = "pairing_addr.txt";
	}

}
