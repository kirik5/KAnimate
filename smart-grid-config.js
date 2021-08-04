const smartgrid = require('smart-grid');

const settings = {
		filename: "smart-grid",
		outputStyle: "less",
		columns: 12,
		offset: "30px",
		mobileFirst: true,
		container: {
			maxWidth: "1170px",
			fields: "30px"
		},
		breakPoints: {
			xxl: {
				width: "1400px"
			},
			xl: {
				width: "1200px"
			},
			lg: {
				width: "992px"
			},
			md: {
				width: "768px",
				fields: "15px"
			},
			sm: {
				width: "576px"
			}
		}
};

smartgrid('./src/less', settings);