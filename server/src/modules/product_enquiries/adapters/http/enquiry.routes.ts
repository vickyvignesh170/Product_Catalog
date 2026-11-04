import { Router } from 'express';
import { PostgresEnquiryRepository } from '@modules/product_enquiries/adapters/db/postgres-enquiry.repository';
import { EnquiryService } from '@modules/product_enquiries/services/enquiry.service';
import { EnquiryController } from './enquiry.controller';

const router = Router();
const enquiryRepository = new PostgresEnquiryRepository();
const enquiryService = new EnquiryService(enquiryRepository);
const enquiryController = new EnquiryController(enquiryService);

router.post('/enquiries', (req, res, next) => enquiryController.createEnquiry(req, res, next));
router.get('/enquiries', (req, res, next) => enquiryController.getAllEnquiries(req, res, next));

export { router as enquiryRoutes };