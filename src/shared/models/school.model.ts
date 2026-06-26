export class SchoolModel {
  private readonly _id: string;
  private readonly _schoolName: string;
  private readonly _schoolSlug: string;
  private readonly _schoolType: string;
  private readonly _schoolNameBn: string | null;

  private readonly _divisionId: number;
  private readonly _divisionName: string | null;
  private readonly _districtId: number;
  private readonly _districtName: string | null;
  private readonly _upazilaId: number | null;
  private readonly _upazilaName: string | null;
  private readonly _postCode: string | null;
  private readonly _address: string | null;
  private readonly _latitude: number | null;
  private readonly _longitude: number | null;

  private readonly _contactEmail: string;
  private readonly _contactPhone: string;
  private readonly _alternatePhone: string | null;
  private readonly _contactPersonName: string | null;
  private readonly _adminUserName: string | null;
  private readonly _website: string | null;

  private readonly _eiin: string | null;
  private readonly _registrationNo: string | null;
  private readonly _mpoStatus: boolean;
  private readonly _banbeis: string | null;
  private readonly _establishedYear: number | null;

  private readonly _governingBodyType: string | null;
  private readonly _recognitionStatus: string | null;
  private readonly _recognizedBy: string | null;
  private readonly _affiliationBoard: string | null;
  private readonly _affiliationNo: string | null;

  private readonly _medium: string;
  private readonly _educationLevel: string[];
  private readonly _shift: string;
  private readonly _hasHostel: boolean;
  private readonly _hasPermanentCampus: boolean;
  private readonly _hostelCapacity: number | null;

  private readonly _headTeacherTitle: string | null;

  private readonly _totalRooms: number | null;
  private readonly _totalStudentCapacity: number | null;
  private readonly _currentStudentCount: number | null;
  private readonly _currentTeacherCount: number | null;

  private readonly _facebookPage: string | null;
  private readonly _youtubeChannel: string | null;

  private readonly _logoUrl: string | null;
  private readonly _logoPlaceholder: string | null;
  private readonly _bannerUrl: string | null;
  private readonly _bannerPlaceholder: string | null;

  private readonly _isCustomDomainEnabled: boolean;
  private readonly _customDomain: string | null;
  private readonly _customDomainVerified: boolean;

  private readonly _status: string;
  private readonly _createdAt: string;
  private readonly _updatedAt: string;
  private readonly _activatedAt: string | null;

  private readonly _activeSubscriptionId: string | null;
  private readonly _subscriptions: any[];
  private readonly _payments: any[];
  private readonly _bankAccounts: any[];

  // The raw underlying object for edge cases
  public readonly _original: Record<string, any>;

  constructor(data: any) {
    this._original = data || {};

    this._id = data?.id ?? '';
    this._schoolName = data?.schoolName ?? '';
    this._schoolSlug = data?.schoolSlug ?? '';
    this._schoolType = data?.schoolType ?? '';
    this._schoolNameBn = data?.schoolNameBn ?? null;

    this._divisionId = data?.divisionId ?? 0;
    this._divisionName = data?.division?.enName ?? data?.division?.bnName ?? null;
    this._districtId = data?.districtId ?? 0;
    this._districtName = data?.district?.enName ?? data?.district?.bnName ?? null;
    this._upazilaId = data?.upazilaId ?? null;
    this._upazilaName = data?.upazila?.enName ?? data?.upazila?.bnName ?? null;
    this._postCode = data?.postCode ?? null;
    this._address = data?.address ?? null;
    this._latitude = data?.latitude ? Number(data.latitude) : null;
    this._longitude = data?.longitude ? Number(data.longitude) : null;

    this._contactEmail = data?.contactEmail ?? '';
    this._contactPhone = data?.contactPhone ?? '';
    this._alternatePhone = data?.alternatePhone ?? null;
    const profile = data?.adminUser?.profile;
    this._adminUserName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : null;
    this._contactPersonName = data?.contactPersonName ?? this._adminUserName;
    this._website = data?.website ?? null;

    this._eiin = data?.eiin ?? null;
    this._registrationNo = data?.registrationNo ?? null;
    this._mpoStatus = !!data?.mpoStatus;
    this._banbeis = data?.banbeis ?? null;
    this._establishedYear = data?.establishedYear ?? null;

    this._governingBodyType = data?.governingBodyType ?? null;
    this._recognitionStatus = data?.recognitionStatus ?? null;
    this._recognizedBy = data?.recognizedBy ?? null;
    this._affiliationBoard = data?.affiliationBoard ?? null;
    this._affiliationNo = data?.affiliationNo ?? null;

    this._medium = data?.medium ?? '';
    this._educationLevel = Array.isArray(data?.educationLevel)
      ? data.educationLevel
      : [];
    this._shift = data?.shift ?? '';
    this._hasHostel = !!data?.hasHostel;
    this._hasPermanentCampus = !!data?.hasPermanentCampus;
    this._hostelCapacity = data?.hostelCapacity ?? null;

    this._headTeacherTitle = data?.headTeacherTitle ?? null;

    this._totalRooms = data?.totalRooms ?? null;
    this._totalStudentCapacity = data?.totalStudentCapacity ?? null;
    this._currentStudentCount = data?.currentStudentCount ?? null;
    this._currentTeacherCount = data?.currentTeacherCount ?? null;

    this._facebookPage = data?.facebookPage ?? null;
    this._youtubeChannel = data?.youtubeChannel ?? null;

    this._logoUrl = data?.logoUrl ?? null;
    this._logoPlaceholder = data?.logoPlaceholder ?? null;
    this._bannerUrl = data?.bannerUrl ?? null;
    this._bannerPlaceholder = data?.bannerPlaceholder ?? null;

    this._isCustomDomainEnabled = !!data?.isCustomDomainEnabled;
    this._customDomain = data?.customDomain ?? null;
    this._customDomainVerified = !!data?.customDomainVerified;

    this._status = data?.status ?? 'pending';
    this._createdAt = data?.createdAt ?? new Date().toISOString();
    this._updatedAt = data?.updatedAt ?? new Date().toISOString();
    this._activatedAt = data?.activatedAt ?? null;

    this._activeSubscriptionId = data?.activeSubscriptionId ?? null;
    this._subscriptions = Array.isArray(data?.subscriptions) ? data.subscriptions : [];
    this._payments = Array.isArray(data?.payments) ? data.payments : [];
    this._bankAccounts = Array.isArray(data?.bankAccounts) ? data.bankAccounts : [];
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get id() {
    return this._id;
  }
  get schoolName() {
    return this._schoolName;
  }
  get schoolSlug() {
    return this._schoolSlug;
  }
  get schoolType() {
    return this._schoolType;
  }
  get schoolNameBn() {
    return this._schoolNameBn;
  }

  get divisionId() {
    return this._divisionId;
  }
  get divisionName() {
    return this._divisionName;
  }
  get districtId() {
    return this._districtId;
  }
  get districtName() {
    return this._districtName;
  }
  get upazilaId() {
    return this._upazilaId;
  }
  get upazilaName() {
    return this._upazilaName;
  }
  get postCode() {
    return this._postCode;
  }
  get address() {
    return this._address;
  }
  get latitude() {
    return this._latitude;
  }
  get longitude() {
    return this._longitude;
  }

  get contactEmail() {
    return this._contactEmail;
  }
  get contactPhone() {
    return this._contactPhone;
  }
  get alternatePhone() {
    return this._alternatePhone;
  }
  get contactPersonName() {
    return this._contactPersonName;
  }
  get adminUserName() {
    return this._adminUserName;
  }
  get website() {
    return this._website;
  }

  get eiin() {
    return this._eiin;
  }
  get registrationNo() {
    return this._registrationNo;
  }
  get mpoStatus() {
    return this._mpoStatus;
  }
  get banbeis() {
    return this._banbeis;
  }
  get establishedYear() {
    return this._establishedYear;
  }

  get governingBodyType() {
    return this._governingBodyType;
  }
  get recognitionStatus() {
    return this._recognitionStatus;
  }
  get recognizedBy() {
    return this._recognizedBy;
  }
  get affiliationBoard() {
    return this._affiliationBoard;
  }
  get affiliationNo() {
    return this._affiliationNo;
  }

  get medium() {
    return this._medium;
  }
  get educationLevel() {
    return this._educationLevel;
  }
  get shift() {
    return this._shift;
  }
  get hasHostel() {
    return this._hasHostel;
  }
  get hasPermanentCampus() {
    return this._hasPermanentCampus;
  }
  get hostelCapacity() {
    return this._hostelCapacity;
  }

  get headTeacherTitle() {
    return this._headTeacherTitle;
  }

  get totalRooms() {
    return this._totalRooms;
  }
  get totalStudentCapacity() {
    return this._totalStudentCapacity;
  }
  get currentStudentCount() {
    return this._currentStudentCount;
  }
  get currentTeacherCount() {
    return this._currentTeacherCount;
  }

  get facebookPage() {
    return this._facebookPage;
  }
  get youtubeChannel() {
    return this._youtubeChannel;
  }

  get logoUrl() {
    return this._logoUrl;
  }
  get logoPlaceholder() {
    return this._logoPlaceholder;
  }
  get bannerUrl() {
    return this._bannerUrl;
  }
  get bannerPlaceholder() {
    return this._bannerPlaceholder;
  }

  get isCustomDomainEnabled() {
    return this._isCustomDomainEnabled;
  }
  get customDomain() {
    return this._customDomain;
  }
  get customDomainVerified() {
    return this._customDomainVerified;
  }

  get status() {
    return this._status;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
  get activatedAt() {
    return this._activatedAt;
  }

  get activeSubscriptionId() {
    return this._activeSubscriptionId;
  }
  get subscriptions() {
    return this._subscriptions;
  }
  get payments() {
    return this._payments;
  }
  get bankAccounts() {
    return this._bankAccounts;
  }
}
