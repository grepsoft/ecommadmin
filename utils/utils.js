var Utils = {
  // function to reformate date to dd-mm-yyyy from yyyy-mm-dd
  reformatDate: function (date) {
    var dateArr = date.split("-");
    return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
  },

  // function to reformate date based on given formate
  reformatDateWithFormate: function (input, inputformate, outputformate) {
    // split input date formate
    let indateformatesplit = inputformate.split("-");
    let outdateformatesplit = outputformate.split("-");
    let mapping = {};
    let inputarr = input.split("-");

    indateformatesplit.forEach((d, idx) => {
      switch (d) {
        case "dd":
        case "d":
          mapping["dd"] = {
            source: idx,
          };
          break;
        case "mm":
        case "m":
          mapping["mm"] = {
            source: idx,
          };
          break;
        case "yyyy":
        case "yy":
          mapping["yyyy"] = {
            source: idx,
          };
          break;
      }
    });

    outdateformatesplit.forEach((d, idx) => {
      switch (d) {
        case "dd":
        case "d":
          mapping["dd"]["destination"] = idx;
          break;
        case "mm":
        case "m":
          mapping["mm"]["destination"] = idx;
          break;
        case "yyyy":
        case "yy":
          mapping["yyyy"]["destination"] = idx;
          break;
      }
    });
    let output = [];
    for (const [key, value] of Object.entries(mapping)) {
      output[value.destination] = inputarr[value.source];
    }

    return output.join("-");
  },

  // get random date of birth
  getRandomDateOfBirth: function (limit = 20) {
    // get a random number between 1 and 31
    const randomDay = ("00" + (Math.floor(Math.random() * 31) + 1)).substr(-2);

    // get a random number between 1 and 12
    const randomMonth = ("00" + (Math.floor(Math.random() * 12) + 1)).substr(
      -2
    );

    // get a random year
    const randomYear = Math.floor(Math.random() * limit) + 1970;

    return `${randomDay}-${randomMonth}-1981`;
  },

  // function to reformate date from 2022-11-20T00:00:00Z to credit credit card format YYYY/MM
  reformateDateToCreditCardFormat: function (date) {
    var dateArr = date.split("-");
    return dateArr[0] + "/" + dateArr[1];
  },

  // given number of days return a future date
  getFutureDate: function (days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  },

  // given a date return the number of days between today and the given date
  getDaysBetween: function (date) {
    var today = new Date();
    var givenDate = new Date(date);
    return Math.round((givenDate - today) / (1000 * 60 * 60 * 24));
  },

  // get a random number between 10000 and 99999
  getRandomNumber: function (low = 10000, high = 99999) {
    return Math.floor(Math.random() * (high - low + 1)) + low;
  },

  stringReplaceTokens: function (string, tokens) {
    let at = 0;
    const result = [];
    const re = /({[0-9]})/g;
    string.split(" ").forEach((word) => {
      const match = word.match(re);
      if (match) {
        word = word.replace(match[0], args[at]);
        at++;
      }

      result.push(word);
    });

    return result.join(" ");
  },

  // formate email for card activation
  getEmailForCardActivation: function (hash, data) {
    return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
					<tbody><tr>
						<td style="padding:10px 0 30px 0">
							<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #cccccc;border-collapse:collapse">
								<tbody><tr>
									<td bgcolor="#000" style="padding:20px 30px 20px 30px">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tbody><tr>
												<td align="left" style="padding:10 0 10 0;color:#fff;font-family:Lato,sans-serif;font-size:12px">
													<h3>
                                                      EZPAYS Corporation
                                                  </h3>
                        </td>
                      </tr>
                    </tbody></table>
									</td>
								</tr>
								<tr>
									<td bgcolor="#ffffff" style="padding:40px 30px 10px 30px">
										<table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tbody><tr>
												<td style="font-family:Lato;font-size:12px;text-transform:capitalize">
													<b>Dear: ${data.name}</b>
												</td>
											</tr>
											<tr>
												<td style="padding:20px 0 0 0;font-family:Lato;font-size:10px">
													You have received a <b>$${data.amount}</b> virtual prepaid card from EZPAYS Corporation - ${data.program}.
												</td>
											</tr>
											<tr>
												<td style="padding:20px 0 0 0;font-family:Lato;font-size:10px">
													To retrieve your virtual prepaid card visit the <a href="https://ezpayscard.com/activate/${hash}"
                                                    target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://ezpayscard.com/activate/${hash};source=gmail&amp;ust=1637179951984000&amp;usg=AOvVaw1tlfZYKk2ENimAs_nBXxTv">Virtual Card Redemption Site.</a>
												</td>
											</tr>
											<tr>
												<td style="padding:20px 0 0 0;font-family:Lato;font-size:10px">
													You will be asked to provide your:
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
													<b>First Name as registered</b>
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
													<b>Last Name as registered</b>
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
													<b>Email Address</b>
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
													<b>Access Code</b>
												</td>
											</tr>
											<tr>
												<td style="padding:10px 0 0 0;font-family:Lato;font-size:20px;font-weight:bold">
													<b>Access Code: ${data.code}</b>
												</td>
											</tr>
											<tr>
												<td style="padding:30px 0 10px 0;font-family:Lato;font-size:10px">
												If you have any questions about your virtual card or experience any issues redeeming your virtual prepaid card, please contact:
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
													<a href="mailto:${data.supportemail}" target="_blank">${data.supportemail}</a>
												</td>
											</tr>
											<tr>
												<td style="padding:0 0 0 0;font-family:Lato;font-size:10px">
												</td>
											</tr>
										</tbody></table>
									</td>
								</tr>
								<tr>
									<td bgcolor="#FDD835" style="padding:20px 30px 20px 30px">
										<table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tbody><tr>
													<td align="center" style="padding:0 0 0 0;font-family:Lato;font-size:8px;color:#2c2c2c">
													All Rights Reserved. EZPAYS Corporation Prepaid cards, N.A. Member FDIC, pursuant to licenses from Visa® U.S.A., Inc. Canadian card programs are issued by various issuing banks pursuant to licenses by Mastercard® International Incorporated and Visa Int. MasterCard® is a registered trademark of MasterCard International Incorporated. Visa® is a registered trademark of Visa Int.
													</td>
											</tr>
										</tbody></table>
									</td>
								</tr>
							</tbody></table>
						</td>
					</tr>
				</tbody></table>        
        `;
  },
};

module.exports = Utils;
