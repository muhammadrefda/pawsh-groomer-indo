import {
    CustomerGetter, Debug,
    FirebaseApp,
    FirstRequestNotificationUtil,
    NotificationUserGetter,
} from "pawsh-utils";

import {Transaction} from "sequelize";
import {TPlatform} from "pawsh-basic-utils";

import {TFirstRequestNotificationDetails} from "pawsh-utils/lib/customer/reminder/types";
import {
    TCustomerResult,
    TMonitorDetails
} from 'pawsh-basic-utils'

const getCustomerResult = async (
    authId: string,
    userAgent: string | undefined,
    transaction?: Transaction
): Promise<TCustomerResult> => {
    const customerGetter = new CustomerGetter(-1, transaction)
    const customer = await customerGetter.getByAuthId(authId)
    const {
        id, email, platform, signUpDate, stripeId
    } = customer
    const customerResult: TCustomerResult = {
        id, authId, email,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phoneNumber: customer.phoneNumber || '',
        profilePictureUrl: customer.profilePictureUrl || '',
        onboarded: customer.onboarded || false,
        isPhoneNumberVerified: customer.isPhoneNumberVerified || false,
        platform, signUpDate, stripeId,
        city: customer.city || '',
        state: customer.state || '',
        booked: customer.lastAppointmentDate !== null,
        location: customer.location || null,
    }
    try {
        customerResult.monitor = await getMonitorData(
            platform, userAgent
        )
    } catch (e) {

    }
    return customerResult
}

type TScheduleData = {
    minNumberOfSelectedDays: number
}


const getMonitorData = async (
    platform: TPlatform,
    userAgent: string | undefined
): Promise<TMonitorDetails | undefined> => {
    const platformType = Debug.getPlatform(userAgent)
    let finalPlatformType: TPlatform
    if (platformType === 'ios') {
        finalPlatformType = 'ios'
    } else if (platformType === 'android') {
        finalPlatformType = 'android'
    } else {
        finalPlatformType = platform
    }
    const monitorCollection = FirebaseApp.getCustomerApp().firestore()
        .collection('monitor')
    const monitorDoc = await monitorCollection
        .doc(finalPlatformType)
        .get()
    const monitorData = monitorDoc.data() as TMonitorDetails | undefined
    if (monitorData) {
        const scheduleDoc = await monitorCollection
            .doc('schedule')
            .get()
        const scheduleData = scheduleDoc.data() as TScheduleData | undefined
        if (scheduleData) {
            monitorData.minNumberOfSelectedDays = scheduleData.minNumberOfSelectedDays
        }
    }
    return monitorData
}


